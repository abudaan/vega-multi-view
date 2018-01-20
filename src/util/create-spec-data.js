import R from 'ramda';
import { loadSpec } from './load-specs';
import { removeViews } from '../index';

const mapIndexed = R.addIndex(R.map);

export default (store, specs, overwrite, type) => {
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
            console.info(`views with ids "${inStore.join('", "')}" are overwritten`);
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

        // check if a view specific vmv config has been provided
        if (Array.isArray(s)) {
            if (s.length === 2) {
                [data.spec, data.vmvConfig] = s;
            } else if (s.length === 1) {
                [data.spec] = s;
            }
        }

        return data;
    }, specsArray);

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
        return new Promise((resolve) => {
            resolve({
                id: data.id,
                spec: specClone,
                vmvConfig,
            });
        });
    }, specsArray);
    return Promise.all(promises);
};
