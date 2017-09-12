'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.status = status;
exports.json = json;
exports.bson = bson;
exports.cson = cson;
exports.yaml = yaml;
exports.arrayBuffer = arrayBuffer;
exports.fetchJSON = fetchJSON;
exports.fetchCSON = fetchCSON;
exports.fetchYAML = fetchYAML;
exports.fetchBSON = fetchBSON;
exports.fetchJSONFiles = fetchJSONFiles;
exports.fetchJSONFiles2 = fetchJSONFiles2;
exports.fetchArraybuffer = fetchArraybuffer;

var _csonParser = require('cson-parser');

var _csonParser2 = _interopRequireDefault(_csonParser);

var _yamljs = require('yamljs');

var _yamljs2 = _interopRequireDefault(_yamljs);

var _bson = require('bson');

var _bson2 = _interopRequireDefault(_bson);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bsonInstance = new _bson2.default(); // fetch helpers
// import fetch from 'isomorphic-fetch';
function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return _promise2.default.resolve(response);
    }
    return _promise2.default.reject(new Error(response.statusText));
}

function json(response) {
    return response.json();
}

function bson(response) {
    return response.blob().then(function (data) {
        return _promise2.default.resolve(bsonInstance.deserialize(data));
    });
}

function cson(response) {
    return response.text().then(function (data) {
        return _promise2.default.resolve(_csonParser2.default.parse(data));
    });
}

function yaml(response) {
    return response.text().then(function (data) {
        return _promise2.default.resolve(_yamljs2.default.parse(data));
    });
}

function arrayBuffer(response) {
    return response.arrayBuffer();
}

function fetchJSON(url) {
    return new _promise2.default(function (resolve, reject) {
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
    return new _promise2.default(function (resolve, reject) {
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
    return new _promise2.default(function (resolve, reject) {
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

function fetchBSON(url) {
    return new _promise2.default(function (resolve, reject) {
        // fetch(url, {
        //   mode: 'no-cors'
        // })
        fetch(url).then(status).then(bson).then(function (data) {
            resolve(data);
        }).catch(function (e) {
            reject(e);
        });
    });
}

function fetchJSONFiles(urlArray) {
    return new _promise2.default(function (resolve, reject) {
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

        _promise2.default.all(promises).then(function (data) {
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
    return new _promise2.default(function (resolve, reject) {
        var promises = [];
        var errors = [];
        var keys = [];

        (0, _entries2.default)(object).forEach(function (_ref) {
            var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
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

        _promise2.default.all(promises).then(function (data) {
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
    return new _promise2.default(function (resolve, reject) {
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