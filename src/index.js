import R from 'ramda';
import * as vega from 'vega';
import vegaAsLeafletLayer from 'vega-as-leaflet-layer/dist';
import { load } from 'fetch-helpers';
import addDebug from './util/debug';
import addTooltips from './util/add-tooltips';
import connectSignals from './util/signals';
import addElements from './util/add-elements';
import addStyling from './util/add-styling';
import createSpecData from './util/create-spec-data';
import { syncPromises } from './util/promise-helpers';
import { version } from '../package.json';

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
                // console.log('element', element);
                // console.log('container', container);
                const config = {
                    view: d.view,
                    renderer: d.renderer || renderer,
                    // container,
                    container: element,
                };
                vegaAsLeafletLayer(config);
            } else {
                view.renderer(vmvConfig.renderer || renderer)
                    .initialize(element);
            }
        }
    });
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
            config = await load(config, type)
                .catch(e => Promise.reject(e));
        } catch (e) {
            return Promise.reject(e);
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

    // add global styling
    addStyling('global', styling, document.body);

    // set up the containing HTML element, defaults to document.body
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
        // check if the element has been added to the DOM
        if (document.getElementById(element.id) === null) {
            document.body.appendChild(containerElement);
        }
    } else if (typeof element !== 'undefined') {
        console.warn('invalid element, using document.body instead');
    }

    // parse all views
    let data = await createSpecData(store, specs, overwrite, type);
    data = addElements(data, containerElement);
    addTooltips(data);
    connectSignals(data, debug);
    if (debug) {
        await addDebug(data);
    }

    // add all views to the HTML
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
                }
                // add view specific styling
                addStyling(d.id, d.vmvConfig.styling, d.element, styling);
                // store view so we can remove or edit it after initialization
                store[d.id] = d;
            });
            resolve(store);
        }, 10);
    });
};


export const addMultipleConfigs = async (configs) => {
    // console.log(configs);
    if (Array.isArray(configs) === false) {
        return Promise.reject(new Error('Please pass an array with urls to config files!'));
    }
    const promises = [];
    configs.forEach((config) => {
        promises.push({
            func: addViews,
            args: [config],
        });
    });
    return syncPromises(promises);
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

export {
    vega,
};

