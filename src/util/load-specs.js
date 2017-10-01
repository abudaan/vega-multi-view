import { fetchJSON, load } from 'fetch-helpers';

export const loadSpec = (spec, type) => load(spec, type);

export const loadSpecs = async (urls) => {
    const specs = [];
    await Promise.all(urls.map(async (url) => {
        const spec = await fetchJSON(url);
        specs.push(spec);
    }));
    return specs;
};
