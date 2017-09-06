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

/*
const debug = (data) => {
    R.forEach((d) => {
        const {
            spec,
            view,
        } = d;
        view.addSignalListener(signal.name, (name, data) => {
            console.log(spec.description, name, data);
        });
    }, view.vega.signals || []);


    const numDataSources = spec.data.length;
    let numLoaded = 0;
    const dataPoller = setInterval(() => {
        R.forEach((data) => {
            const loaded = view.data(data.name);
            if (loaded !== null) {
                console.log('[DATA]:', spec.description, data.name, loaded);
                numLoaded += 1;
            }
            if (numLoaded === numDataSources) {
                // console.log('all data loaded');
                clearInterval(dataPoller);
            }
        }, views);
    }, 10);
};
*/

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
    if (R.isNil(element) === false) {
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

    element.style.width = `${d.spec.width}px`;
    element.style.height = `${d.spec.height}px`;
    container.appendChild(element);
    return {
        ...d,
        element,
    };
}, data);


const createViews = (config) => {
    let {
        container = document.body,
        specs,
    } = config;
    const {
        className = false,
        runtimes,
        renderer = 'canvas',
    } = config;

    if (R.isNil(container)) {
        container = document.body;
    }

    if (R.isArrayLike(specs) === false) {
        specs = [specs];
    }

    const specUrls = R.filter(spec => typeof spec === 'string', specs);
    specs = R.filter(spec => typeof spec !== 'string', specs);

    return new Promise((resolve, reject) => {
        let data;
        loadSpecs(specUrls)
            .then((loadedSpecs) => {
                specs = [...specs, ...loadedSpecs];
                data = mapIndexed((s, i) => {
                    const id = `spec_${i}`;
                    let runtime = {};
                    const spec = { ...s };
                    if (typeof spec.runtime !== 'undefined') {
                        runtime = { ...spec.runtime };
                        delete spec.runtime;
                    } else if (R.isNil(runtimes[i]) === false) {
                        runtime = runtimes[i];
                    }
                    const view = new View(parse(spec));
                    return {
                        id,
                        spec,
                        view,
                        runtime,
                    };
                }, specs);
                data = addElements(data, container, className);
                addTooltips(data);
                connectSignals(data);
                // wait until the next paint cycle so the created elements
                // are added to the DOM
                setTimeout(() => {
                    addViews(data, renderer);
                    resolve({
                        data,
                    });
                }, 0);
            });
    });
};

export default createViews;

