import R from 'ramda';
import xs from 'xstream';
import { TileLayer, Map } from 'leaflet';
import { parse, View } from 'vega';
import { vega as vegaTooltip } from 'vega-tooltip';
import { fetchJSON } from './util/fetch-helpers';
import VegaLayer from './util/leaflet-vega';

const mapIndexed = R.addIndex(R.map);
let streamId = 0;

const createLeafletVega = async (data, renderer) => {
    const {
        spec,
        view,
        runtime,
        element,
    } = data;
    const signals = spec.signals || [];
    const zoom = R.find(R.propEq('name', 'zoom'))(signals);
    const latitude = R.find(R.propEq('name', 'latitude'))(signals);
    const longitude = R.find(R.propEq('name', 'longitude'))(signals);

    if (R.isNil(zoom) || R.isNil(latitude) || R.isNil(longitude)) {
        console.error('incomplete map spec; if you want to add Vega as a Leaflet layer you should provide signals for zoom, latitude and longitude');
        return;
    }

    const leafletMap = new Map(element, {
        zoomAnimation: false,
    }).setView([latitude.value, longitude.value], zoom.value);

    new TileLayer(
        'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
        },
    ).addTo(leafletMap);

    new VegaLayer(view, {
        renderer: runtime.renderer || renderer,
        // Make sure the legend stays in place
        delayRepaint: true,
    }).addTo(leafletMap);
};


const addDebug = (datas) => {
    R.forEach((d) => {
        const {
            spec,
            view,
        } = d;

        R.forEach((signal) => {
            view.addSignalListener(signal.name, (signalName, signalData) => {
                console.log('[SIGNAL] %s %s %O', spec.description || ' - ', signalName, signalData);
            });
        }, spec.signals || []);
    }, datas);

    const promises = R.map(d => new Promise((resolve) => {
        const {
            spec,
            view,
        } = d;
        const numDataSources = spec.data.length;
        let numLoaded = 0;
        if (R.isNil(spec.data) || spec.data.length === 0) {
            resolve();
        }
        const dataPoller = setInterval(() => {
            R.forEach((data) => {
                const loaded = view.data(data.name);
                if (loaded !== null) {
                    console.log('[DATA] %s %s %O', spec.description || ' - ', data.name, loaded);
                    numLoaded += 1;
                }
                if (numLoaded === numDataSources) {
                    // console.log('all data loaded');
                    clearInterval(dataPoller);
                    resolve();
                }
            }, spec.data);
        }, 10);
    }), datas);

    return Promise.all(promises);
};


const loadSpec = (spec) => {
    if (typeof spec !== 'string') {
        return Promise.resolve(spec);
    }
    return fetchJSON(spec)
        .then(data => data, () => null)
        .catch(() => null);
};


const loadSpecs = async (urls) => {
    const specs = [];
    await Promise.all(urls.map(async (url) => {
        const spec = await fetchJSON(url);
        specs.push(spec);
    }));
    return specs;
};


const publishSignal = (data) => {
    const {
        runtime,
        view,
    } = data;
    const streams = {};

    if (R.isNil(runtime.publish)) {
        return streams;
    }

    let publishes = runtime.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    R.forEach((publish) => {
        try {
            const s = xs.create({
                start(listener) {
                    view.addSignalListener(publish.signal, (name, value) => {
                        listener.next(value);
                    });
                },
                stop() {
                    view.removeSignalListener(publish.signal);
                },

                id: streamId,
            });
            streamId += 1;
            streams[publish.as] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, publishes);

    return streams;
};


const subscribeToSignal = (data, streams) => {
    const {
        view,
        spec,
        runtime,
    } = data;

    if (R.isNil(runtime.subscribe)) {
        return;
    }

    let subscribes = runtime.subscribe;
    if (Array.isArray(subscribes) === false) {
        subscribes = [subscribes];
    }

    R.forEach((subscribe) => {
        const s = streams[subscribe.signal];
        if (R.isNil(s)) {
            console.error(`no stream for signal "${subscribe.signal}"`);
            return;
        }
        if (R.isNil(R.find(R.propEq('name', subscribe.as))(spec.signals))) {
            console.error(`no signal "${subscribe.as}" found in spec`);
            return;
        }

        s.addListener({
            next: (value) => {
                view.signal(subscribe.as, value).run();
            },
            error: (err) => {
                console.error(`Stream ${s.id} error: ${err}`);
            },
            complete: () => {
                console.log(`Stream ${s.id} is done`);
            },
        });
    }, subscribes);
};


const addViews = (data, renderer) => {
    data.forEach((d, i) => {
        const {
            view,
            runtime,
            element,
        } = d;
        if (view !== null) {
            if (runtime.leaflet === true) {
                createLeafletVega(d, renderer);
            } else {
                view.renderer(runtime.renderer || renderer)
                    .initialize(element);
            }
        }
    });
};


const addTooltips = (data) => {
    data.forEach((d) => {
        if (d.view !== null && typeof d.runtime.tooltipOptions !== 'undefined') {
            vegaTooltip(d.view, d.runtime.tooltipOptions);
        }
    });
};

const connectSignals = (data) => {
    let streams = {};
    R.forEach((d) => {
        if (d.view !== null) {
            streams = { ...streams, ...publishSignal(d) };
        }
    }, R.values(data));

    R.forEach((d) => {
        if (d.view !== null) {
            subscribeToSignal(d, streams);
        }
    }, R.values(data));
};


const addElements = (data, container, className) => R.map((d) => {
    if (d.view === null) {
        return {
            ...d,
            element: null,
        };
    }
    let element = d.runtime.element;
    if (element === false) {
        // headless rendering
        element = null;
    } else if (R.isNil(element) === false) {
        if (typeof element === 'string') {
            element = document.getElementById(d.runtime.element);
            if (R.isNil(element)) {
                console.error(`element "${d.runtime.element}" could not be found`);
                return {
                    ...d,
                    element: null,
                };
            }
        } else if (element instanceof HTMLElement !== true) {
            console.error(`element "${d.runtime.element}" is not a valid HTMLElement`);
            return {
                ...d,
                element: null,
            };
        }
    } else {
        element = document.createElement('div');
        element.id = d.id;
        if (typeof d.className === 'string') {
            element.className = d.className;
        } else if (typeof className === 'string') {
            element.className = className;
        }
        element.style.width = `${d.spec.width}px`;
        element.style.height = `${d.spec.height}px`;
        if (container !== null) {
            container.appendChild(element);
        } else {
            console.warn('could not add Vega view: HTML container element is null');
        }
    }

    return {
        ...d,
        element,
    };
}, data);


const createSpecData = (specs, runtimes) => {
    const promises = mapIndexed(async (s, i) => {
        const spec = await loadSpec(s);
        const id = `spec_${i}`;
        if (spec === null) {
            return Promise.resolve({
                id,
                spec: `Vega spec ${s} could not be loaded`,
                view: null,
                runtime: null,
            });
        }
        let runtime = {};
        const specClone = { ...spec };
        if (R.isNil(specClone.runtime) === false) {
            runtime = { ...specClone.runtime };
            delete specClone.runtime;
        } else if (R.isNil(runtimes[i]) === false) {
            runtime = runtimes[i];
        }
        const view = new View(parse(specClone));
        return new Promise((resolve) => {
            resolve({
                id,
                spec: specClone,
                view,
                runtime,
            });
        });
    }, specs);
    return Promise.all(promises);
};


const createViews = async (config) => {
    const {
        run = true,
        specs,
        element,
        className = false,
        runtimes = [],
        renderer = 'canvas',
        debug = false,
    } = config;

    let specsArray = specs;
    let containerElement = null;

    if (R.isNil(element)) {
        containerElement = document.body;
    } else if (typeof element === 'string') {
        containerElement = document.getElementById(element);
        if (R.isNil(containerElement)) {
            console.error(`element "${element}" could not be found`);
            return Promise.reject(`element "${element}" could not be found`);
        }
    } else if (element instanceof HTMLElement) {
        containerElement = element;
    }


    if (R.isArrayLike(specsArray) === false) {
        specsArray = [specsArray];
    }

    let data = await createSpecData(specsArray, runtimes);
    data = addElements(data, containerElement, className);
    addTooltips(data);
    connectSignals(data);
    if (debug) {
        await addDebug(data);
    }

    return new Promise((resolve) => {
        // wait until the next paint cycle so the created elements
        // are added to the DOM, add the views, then resolve
        setTimeout(() => {
            addViews(data, renderer);
            data.forEach((d) => {
                if (d.view !== null &&
                    (d.runtime.run === true ||
                        (run === true && d.runtime.run !== false))
                ) {
                    d.view.run();
                }
            });
            resolve(data);
        }, 0);
    });
};

export const showSpecInTab = (spec) => {
    // const json = encodeURIComponent(JSON.stringify(TestSpec4));
    // window.open(`data:application/json, ${json}`, '_blank');
    const json = JSON.stringify(spec, null, 4);
    const w = window.open();
    w.document.open();
    w.document.write(`<html><body><pre>${json}</pre></body></html>`);
    w.document.close();
};

export default createViews;

