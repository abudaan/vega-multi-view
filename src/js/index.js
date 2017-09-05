import R from 'ramda';
import L from 'leaflet';
import { parse, View } from 'vega';
import { vega as vegaTooltip } from 'vega-tooltip';
import { fetchJSON } from './util/fetch-helpers';
import initLeafletVega from './util/leaflet-vega';

const Rx = require('rxjs/Rx');

initLeafletVega();

const createLeafletVega = async (elem, spec, view) => {
    const signals = spec.signals || [];
    const zoom = R.find(R.propEq('name', 'zoom'))(signals);
    const latitude = R.find(R.propEq('name', 'latitude'))(signals);
    const longitude = R.find(R.propEq('name', 'longitude'))(signals);

    if (R.isNil(zoom) || R.isNil(latitude) || R.isNil(longitude)) {
        console.error('incomplete map spec');
        return;
    }

    const map = L.map(elem, {
        zoomAnimation: false,
    }).setView([latitude.value, longitude.value], zoom.value);

    L.tileLayer(
        'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
        },
    ).addTo(map);

    L.vega(view, {
        renderer: spec.runtime.renderer || 'canvas',
        // Make sure the legend stays in place
        delayRepaint: true,
    }).addTo(map);
};


// const loadSpecs = async (urls: string[]) => {
const loadSpecs = async (urls) => {
    let i = 0;
    const specs = {};
    await Promise.all(urls.map(async (url) => {
        const spec = await fetchJSON(url);
        const id = `spec_${i}`;
        const view = new View(parse(spec));
        if (spec.runtime && spec.runtime.tooltipOptions) {
            vegaTooltip(view, spec.runtime.tooltipOptions);
        }

        const debug = false;
        if (debug) {
            R.forEach((signal) => {
                view.addSignalListener(signal.name, (name, data) => {
                    console.log(spec.description, name, data);
                });
            }, spec.signals || []);


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
                }, spec.data || []);
            }, 10);
        }

        specs[id] = {
            id,
            spec,
            view,
        };
        i += 1;
    }));
    return specs;
};


const createStream = (data) => {
    const {
        spec,
        view,
    } = data;

    const streams = {};

    if (R.isNil(spec.runtime) || R.isNil(spec.runtime.publish)) {
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
    }, spec.runtime.publish);

    return streams;
};


const subscribeToStream = (data, streams) => {
    const {
        spec,
        view,
    } = data;

    if (R.isNil(spec.runtime) || R.isNil(spec.runtime.subscribe)) {
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
    }, spec.runtime.subscribe);
};


const addViews = (specs, divs) => {
    specs.forEach((d, i) => {
        const {
            id,
            spec,
            view,
        } = d;
        const div = divs[i];
        if (spec.runtime.leaflet === true) {
            createLeafletVega(div, spec, view);
        } else {
            view.renderer(spec.runtime.renderer || 'canvas')
                .initialize(`#${id}`);
        }
    });
};


const addDivs = (specs, container, cssClass) => {
    const divs = [];
    specs.forEach((d) => {
        const elem = document.createElement('div');
        const {
            id,
            spec,
        } = d;
        elem.id = id;
        elem.className = cssClass;
        elem.style.width = `${spec.width}px`;
        elem.style.height = `${spec.height}px`;
        container.appendChild(elem);
        divs.push(elem);
    });
    return divs;
};


const createViews = (data) => {
    const {
        container,
        cssClass,
        urls,
    } = data;

    return new Promise((resolve, reject) => {
        loadSpecs(urls)
            .then((specs) => {
                let streams = {};
                R.forEach((spec) => {
                    streams = { ...streams, ...createStream(spec) };
                }, R.values(specs));

                R.forEach((spec) => {
                    subscribeToStream(spec, streams);
                }, R.values(specs));

                const specsArray = R.map(id => specs[id], R.keys(specs));
                const divs = addDivs(specsArray, container, cssClass);
                setTimeout(() => {
                    addViews(specsArray, divs);
                    resolve('done');
                }, 0);
            });
    });
};


export default createViews;

