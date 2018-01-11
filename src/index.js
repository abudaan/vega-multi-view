import R from 'ramda';
import { parse, View } from 'vega';
import vegaAsLeafletLayer from 'vega-as-leaflet-layer/dist';
import { load } from 'fetch-helpers';
import addDebug from './util/debug';
import addTooltips from './util/add-tooltips';
import connectSignals from './util/signals';
import addElements from './util/add-elements';
import addStyling from './util/add-styling';
import { loadSpec } from './util/load-specs';
import { version } from '../package.json';

const mapIndexed = R.addIndex(R.map);
const store = {};

const renderViews = (data, renderer, container) => {
    data.forEach((d) => {
        const {
            view,
            vmvConfig,
            element,
        } = d;
        if (view !== null) {
            if (vmvConfig.leaflet === true) {
                const config = {
                    view: d.view,
                    renderer: d.renderer || renderer,
                    container,
                    mapElement: element,
                };
                vegaAsLeafletLayer(config);
            } else {
                view.renderer(vmvConfig.renderer || renderer)
                    .initialize(element);
            }
        }
    });
};

const createSpecData = (specs, type) => {
    const promises = mapIndexed(async (data) => {
        let spec = null;
        try {
            const t = data.spec.type || type;
            spec = await loadSpec(data.spec, t);
        } catch (e) {
            console.error(e);
        }
        if (spec === null) {
            return Promise.resolve({
                id: data.id,
                spec: `Vega spec ${data.spec} could not be loaded`,
                view: null,
                vmvConfig: null,
            });
        }
        const specClone = { ...spec };
        let vmvConfig = data.vmvConfig || { styling: {} };
        if (R.isNil(specClone.vmvConfig) === false) {
            vmvConfig = { ...specClone.vmvConfig };
            delete specClone.vmvConfig;
        }
        if (R.isNil(vmvConfig.styling)) {
            vmvConfig.styling = {};
        }
        const view = new View(parse(specClone));
        return new Promise((resolve) => {
            resolve({
                id: data.id,
                spec: specClone,
                view,
                vmvConfig,
            });
        });
    }, specs);
    return Promise.all(promises);
};


export const removeViews = (...args) => {
    const ids = R.flatten(args);
    // console.log(ids);
    ids.forEach((id) => {
        const data = store[id];
        if (R.isNil(data) === false) {
            const elem = data.element;
            if (elem !== null) {
                elem.parentNode.removeChild(elem);
            }
            delete store[id];
        }
    });
    return store;
};


export const addViews = async (cfg, type = null) => {
    let config = cfg;
    if (typeof config === 'string') {
        if (config.length === 0) {
            return Promise.reject(new Error('You have passed an empty string!'));
        }
        try {
            config = await load(config, type);
        } catch (e) {
            console.error(e);
        }
    }

    // console.log(config);
    const {
        run = true,
        hover = false,
        specs,
        element,
        renderer = 'canvas',
        debug = false,
        overwrite = false,
        styling = {},
    } = config;

    addStyling('global', styling, document.body);

    let specsArray;
    const [
        inStore,
        outStore,
    ] = R.splitWhen(key => R.isNil(store[key]), R.keys(specs));

    if (overwrite) {
        removeViews(inStore);
        if (inStore.length === 1) {
            console.info(`view with id "${inStore[0]}" is overwritten`);
        } else if (inStore.length > 1) {
            console.info(`views with ids "${inStore.join('", "')}" is overwritten`);
        }
        specsArray = R.keys(specs);
    } else {
        if (inStore.length === 1) {
            console.warn(`view with id "${inStore[0]}" already exist!`);
        } else if (inStore.length > 1) {
            console.warn(`views with ids "${inStore.join('", "')}" already exist!`);
        }
        specsArray = outStore;
    }

    specsArray = R.map((key) => {
        const s = specs[key];
        const data = {
            spec: s,
            id: key,
        };

        if (Array.isArray(s)) {
            if (s.length === 2) {
                [data.spec, data.vmvConfig] = s;
            } else if (s.length === 1) {
                [data.spec] = s;
            }
        }

        return data;
    }, specsArray);

    // default to document.body
    let containerElement = document.body;
    if (typeof element === 'string') {
        containerElement = document.getElementById(element);
        if (R.isNil(containerElement)) {
            containerElement = document.createElement('div');
            containerElement.id = element;
            document.body.appendChild(containerElement);
            // console.error(`element "${element}" could not be found`);
            // return Promise.reject(`element "${element}" could not be found`);
        }
    } else if (element instanceof HTMLElement) {
        containerElement = element;
        if (document.getElementById(element) === null) {
            document.body.appendChild(containerElement);
        }
    } else if (typeof element !== 'undefined') {
        console.warn('invalid element, using document.body instead');
    }

    let data = await createSpecData(specsArray, type);
    data = addElements(data, containerElement);
    addTooltips(data);
    connectSignals(data);
    if (debug) {
        await addDebug(data);
    }

    return new Promise((resolve) => {
        // wait until the next paint cycle so the created elements
        // are added to the DOM, add the views, then resolve
        setTimeout(() => {
            renderViews(data, renderer, containerElement);
            data.forEach((d) => {
                if (d.view !== null) {
                    if (d.vmvConfig.run === true ||
                        (run === true && d.vmvConfig.run !== false)) {
                        d.view.run();
                    }
                    if (d.vmvConfig.hover === true ||
                        (hover === true && d.vmvConfig.hover !== false)) {
                        d.view.hover();
                    }
                    addStyling(d.id, d.vmvConfig.styling, d.element, styling);
                }
                store[d.id] = d;
            });
            resolve(store);
        }, 0);
    });
};

/*
    credits: https://stackoverflow.com/questions/27705640/display-json-in-a-readable-format-in-a-new-tab
*/
export const showSpecInTab = (spec) => {
    // const json = encodeURIComponent(JSON.stringify(TestSpec4));
    // window.open(`data: application / json, ${json } `, '_blank');
    const json = JSON.stringify(spec, null, 4);
    const w = window.open();
    w.document.open();
    w.document.write(`< html > <body><pre>${json}</pre></body></html > `);
    w.document.close();
};

const v = `vega-multi-view ${version}`;
export {
    v as version,
};

