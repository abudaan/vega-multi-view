import { fetchJSON, fetchYAML, fetchBSON, fetchCSON } from './fetch-helpers';


export const loadSpec = (spec, type) => {
    let t = type;
    let json;
    if (t === null) {
        if (typeof spec !== 'string') {
            t = 'object';
        } else if (spec.search(/.ya?ml/) !== -1) {
            t = 'yaml';
        } else if (spec.search(/.json/) !== -1) {
            t = 'json';
        } else if (spec.search(/.bson/) !== -1) {
            t = 'bson';
        } else if (spec.search(/.cson/) !== -1) {
            t = 'cson';
        } else {
            try {
                json = JSON.parse(spec);
                t = 'json_string';
            } catch (e) {
                t = null;
            }
        }
    }

    if (t === 'object') {
        return Promise.resolve(spec);
    }
    if (t === 'json_string') {
        return Promise.resolve(json);
    }
    if (t === 'json') {
        return fetchJSON(spec)
            .then(data => data, () => null)
            .catch(() => null);
    }
    if (t === 'yaml') {
        return fetchYAML(spec)
            .then(data => data, () => null)
            .catch(() => null);
    }
    if (t === 'bson') {
        return fetchBSON(spec)
            .then(data => data, () => null)
            .catch(() => null);
    }
    if (t === 'cson') {
        return fetchCSON(spec)
            .then(data => data, () => null)
            .catch(() => null);
    }
    return Promise.reject('not a supported type');
};


export const loadSpecs = async (urls) => {
    const specs = [];
    await Promise.all(urls.map(async (url) => {
        const spec = await fetchJSON(url);
        specs.push(spec);
    }));
    return specs;
};
