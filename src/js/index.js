import R from 'ramda';
import L from 'leaflet';
import { parse, View } from 'vega';
import { vega as vegaTooltip } from 'vega-tooltip';
import { fetchJSON } from './util/fetch-helpers';
import initLeafletVega from './util/leaflet-vega';

const Rx = require('rxjs/Rx');

const mapIndexed = R.addIndex(R.map);

initLeafletVega();

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
        console.error('incomplete map spec');
        return;
    }

    const map = L.map(element, {
        zoomAnimation: false,
    }).setView([latitude.value, longitude.value], zoom.value);

    L.tileLayer(
        'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
        },
    ).addTo(map);

    L.vega(view, {
        renderer: runtime.renderer || renderer,
        // Make sure the legend stays in place
        delayRepaint: true,
    }).addTo(map);
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
        if (R.isNil(spec.data)) {
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
        return spec;
    }
    return fetchJSON(spec);
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

    R.forEach((publish) => {
        try {
            const s = new Rx.Subject();
            view.addSignalListener(publish.signal, (name, value) => {
                s.next(value);
            });
            streams[publish.as] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, runtime.publish);

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
        s.subscribe((value) => {
            // console.log(subscribe.as, value);
            view.signal(subscribe.as, value).run();
        });
    }, runtime.subscribe);
};


const addViews = (data, renderer) => {
    data.forEach((d, i) => {
        const {
            view,
            runtime,
            element,
        } = d;
        if (runtime.leaflet === true) {
            createLeafletVega(d, renderer);
        } else {
            view.renderer(runtime.renderer || renderer)
                .initialize(element);
        }
    });
};


const addTooltips = (data) => {
    data.forEach((d) => {
        if (typeof d.runtime.tooltipOptions !== 'undefined') {
            vegaTooltip(d.view, d.runtime.tooltipOptions);
        }
    });
};

const connectSignals = (data) => {
    let streams = {};
    R.forEach((d) => {
        streams = { ...streams, ...publishSignal(d) };
    }, R.values(data));

    R.forEach((d) => {
        subscribeToSignal(d, streams);
    }, R.values(data));
};


const addElements = (data, container, className) => R.map((d) => {
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
    }
    if (element !== null) {
        element.style.width = `${d.spec.width}px`;
        element.style.height = `${d.spec.height}px`;
        container.appendChild(element);
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
        let runtime = {};
        const specClone = { ...spec };
        if (typeof specClone.runtime !== 'undefined') {
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
    let {
        container = document.body,
        specs,
    } = config;
    const {
        className = false,
        runtimes,
        renderer = 'canvas',
        debug = true, // false
    } = config;

    if (R.isNil(container)) {
        container = document.body;
    }

    if (R.isArrayLike(specs) === false) {
        specs = [specs];
    }

    let data = await createSpecData(specs, runtimes);
    data = addElements(data, container, className);
    addTooltips(data);
    connectSignals(data);
    if (debug) {
        await addDebug(data);
    }

    return new Promise((resolve) => {
        // wait until the next paint cycle so the created elements
        // are added to the DOM, add the viewsm, then resolve
        setTimeout(() => {
            addViews(data, renderer);
            resolve({
                data,
            });
        }, 0);
    });
};

export default createViews;

