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
    return response.text().then(function (data) {
        return Promise.resolve(CSON.parse(data));
    });
}

export function yaml(response) {
    return response.text().then(function (data) {
        return Promise.resolve(YAML.parse(data));
    });
}

export function arrayBuffer(response) {
    return response.arrayBuffer();
}

export function fetchJSON(url) {
    return new Promise(function (resolve, reject) {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url).then(status).then(json).then(function (data) {
            resolve(data);
        }).catch(function (e) {
            reject(e);
        });
    });
}

export function fetchCSON(url) {
    return new Promise(function (resolve, reject) {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url).then(status).then(cson).then(function (data) {
            resolve(data);
        }).catch(function (e) {
            reject(e);
        });
    });
}

export function fetchYAML(url) {
    return new Promise(function (resolve, reject) {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url).then(status).then(yaml).then(function (data) {
            resolve(data);
        }).catch(function (e) {
            reject(e);
        });
    });
}

export function fetchJSONFiles(urlArray) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var errors = [];

        urlArray.forEach(function (url) {
            promises.push(fetch(url).then(status).then(json).then(function (data) {
                return data;
            }).catch(function (e) {
                errors.push(url);
                return null;
            }));
        });

        Promise.all(promises).then(function (data) {
            var jsonFiles = data.filter(function (file) {
                return file !== null;
            });
            resolve({ jsonFiles: jsonFiles, errors: errors });
        }, function (error) {
            reject({ error: error });
        });
    });
}

export function fetchJSONFiles2(object, baseurl) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var errors = [];
        var keys = [];

        Object.entries(object).forEach(function (_ref) {
            var _ref2 = babelHelpers.slicedToArray(_ref, 2),
                key = _ref2[0],
                url = _ref2[1];

            keys.push(key);
            promises.push(fetch(baseurl + url).then(status).then(json).then(function (data) {
                return data;
            }).catch(function (e) {
                errors.push(url);
                return null;
            }));
        });

        Promise.all(promises).then(function (data) {
            var jsonFiles = {};
            data.forEach(function (file, index) {
                if (file !== null) {
                    jsonFiles[keys[index]] = file;
                }
            });
            resolve({ jsonFiles: jsonFiles, errors: errors });
        }, function (error) {
            reject({ error: error });
        });
    });
}

export function fetchArraybuffer(url) {
    return new Promise(function (resolve, reject) {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url).then(status).then(arrayBuffer).then(function (data) {
            resolve(data);
        }).catch(function (e) {
            reject(e);
        });
    });
}