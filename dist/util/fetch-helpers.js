'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // fetch helpers
// import fetch from 'isomorphic-fetch';


exports.status = status;
exports.json = json;
exports.cson = cson;
exports.yaml = yaml;
exports.arrayBuffer = arrayBuffer;
exports.fetchJSON = fetchJSON;
exports.fetchCSON = fetchCSON;
exports.fetchYAML = fetchYAML;
exports.fetchJSONFiles = fetchJSONFiles;
exports.fetchJSONFiles2 = fetchJSONFiles2;
exports.fetchArraybuffer = fetchArraybuffer;

var _csonParser = require('cson-parser');

var _csonParser2 = _interopRequireDefault(_csonParser);

var _yamljs = require('yamljs');

var _yamljs2 = _interopRequireDefault(_yamljs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response);
    }
    return Promise.reject(new Error(response.statusText));
}

function json(response) {
    return response.json();
}

function cson(response) {
    return response.text().then(function (data) {
        return Promise.resolve(_csonParser2.default.parse(data));
    });
}

function yaml(response) {
    return response.text().then(function (data) {
        return Promise.resolve(_yamljs2.default.parse(data));
    });
}

function arrayBuffer(response) {
    return response.arrayBuffer();
}

function fetchJSON(url) {
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

function fetchCSON(url) {
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

function fetchYAML(url) {
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

function fetchJSONFiles(urlArray) {
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

function fetchJSONFiles2(object, baseurl) {
    return new Promise(function (resolve, reject) {
        var promises = [];
        var errors = [];
        var keys = [];

        Object.entries(object).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
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

function fetchArraybuffer(url) {
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