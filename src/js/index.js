import R from 'ramda';
import { parse, View } from 'vega';
import vegaAsLeafletLayer from 'vega-as-leaflet-layer';
import addDebug from './util/debug';
import addTooltips from './util/add-tooltips';
import connectSignals from './util/signals';
import addElements from './util/add-elements';
import { loadSpec } from './util/load-specs';

const mapIndexed = R.addIndex(R.map);
let firstRun = true;
const store = {};
const VERSION = '1.1.0';

const renderViews = (data, renderer) => {
    data.forEach((d) => {
        const {
            view,
            vmvConfig,
            element,
        } = d;
        if (view !== null) {
            if (vmvConfig.leaflet === true) {
                const config = {
                    ...d,
                    renderer: d.renderer || renderer,
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
            spec = await loadSpec(data.spec, type);
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
        let vmvConfig = data.vmvConfig || {};
        if (R.isNil(specClone.vmvConfig) === false) {
            vmvConfig = { ...specClone.vmvConfig };
            delete specClone.vmvConfig;
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
                data.parent.removeChild(elem);
            }
            delete store[id];
        }
    });
    return store;
};


export const addViews = async (config, type = null) => {
    if (firstRun === true) {
        console.log(`vega-multi-view ${VERSION}`);
        firstRun = false;
    }

    const {
        run = true,
        hover = false,
        specs,
        element,
        cssClass = false,
        renderer = 'canvas',
        debug = false,
        overwrite = false,
    } = config;

    let specsArray;
    const [
        inStore,
        outStore,
    ] = R.splitWhen(key => R.isNil(store[key]), R.keys(specs));

    if (overwrite) {
        removeViews(inStore);
        specsArray = specs;
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
        if (Array.isArray(s) && s.length === 2) {
            data.spec = s[0];
            data.vmcConfig = s[1];
        }
        return data;
    }, R.keys(specs));


    let containerElement = null;

    if (R.isNil(element)) {
        containerElement = document.body;
    } else if (typeof element === 'string') {
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
    }

    let data = await createSpecData(specsArray, type);
    data = addElements(data, containerElement, cssClass);
    addTooltips(data);
    connectSignals(data);
    if (debug) {
        await addDebug(data);
    }

    return new Promise((resolve) => {
        // wait until the next paint cycle so the created elements
        // are added to the DOM, add the views, then resolve
        setTimeout(() => {
            renderViews(data, renderer);
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
    // window.open(`data:application / json, ${json }`, '_blank');
    const json = JSON.stringify(spec, null, 4);
    const w = window.open();
    w.document.open();
    w.document.write(`< html > <body><pre>${json}</pre></body></html > `);
    w.document.close();
};

