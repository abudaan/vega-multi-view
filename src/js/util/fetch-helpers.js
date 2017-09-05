// fetch helpers
// import fetch from 'isomorphic-fetch';
import CSON from 'cson-parser';
import YAML from 'yamljs';

export function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(new Error(response.statusText));
}

export function json(response) {
    return response.json();
}

export function cson(response) {
    return response.text()
        .then(data => Promise.resolve(CSON.parse(data)));
}

export function yaml(response) {
    return response.text()
        .then(data => Promise.resolve(YAML.parse(data)));
}

export function arrayBuffer(response) {
    return response.arrayBuffer();
}


export function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url)
            .then(status)
            .then(json)
            .then((data) => {
                resolve(data);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

export function fetchCSON(url) {
    return new Promise((resolve, reject) => {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url)
            .then(status)
            .then(cson)
            .then((data) => {
                resolve(data);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

export function fetchYAML(url) {
    return new Promise((resolve, reject) => {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url)
            .then(status)
            .then(yaml)
            .then((data) => {
                resolve(data);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

export function fetchJSONFiles(urlArray) {
    return new Promise((resolve, reject) => {
        const promises = [];
        const errors = [];

        urlArray.forEach((url) => {
            promises.push(
                fetch(url)
                    .then(status)
                    .then(json)
                    .then(data => data)
                    .catch((e) => {
                        errors.push(url);
                        return null;
                    }),
            );
        });

        Promise.all(promises)
            .then(
            (data) => {
                const jsonFiles = data.filter(file => file !== null);
                resolve({ jsonFiles, errors });
            },
            (error) => {
                reject({ error });
            },
        );
    });
}

export function fetchJSONFiles2(object, baseurl) {
    return new Promise((resolve, reject) => {
        const promises = [];
        const errors = [];
        const keys = [];

        Object.entries(object).forEach(([key, url]) => {
            keys.push(key);
            promises.push(
                fetch(baseurl + url)
                    .then(status)
                    .then(json)
                    .then(data => data)
                    .catch((e) => {
                        errors.push(url);
                        return null;
                    }),
            );
        });

        Promise.all(promises)
            .then(
            (data) => {
                const jsonFiles = {};
                data.forEach((file, index) => {
                    if (file !== null) {
                        jsonFiles[keys[index]] = file;
                    }
                });
                resolve({ jsonFiles, errors });
            },
            (error) => {
                reject({ error });
            },
        );
    });
}

export function fetchArraybuffer(url) {
    return new Promise((resolve, reject) => {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url)
            .then(status)
            .then(arrayBuffer)
            .then((data) => {
                resolve(data);
            })
            .catch((e) => {
                reject(e);
            });
    });
}
