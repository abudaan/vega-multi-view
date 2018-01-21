'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.syncPromises = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var syncPromises = function syncPromises(promises) {
    return new _promise2.default(function (resolve, reject) {
        var index = 0;
        var max = promises.length;
        var errors = [];
        var results = [];

        var startPromise = function startPromise(promise, cb) {
            var func = promise.func,
                args = promise.args;

            func.apply(undefined, (0, _toConsumableArray3.default)(args)).then(function (result) {
                results.push(result);
                cb();
            }).catch(function (error) {
                errors.push(error);
                cb();
            });
        };

        var next = function next() {
            index += 1;
            if (index < max) {
                startPromise(promises[index], next);
            } else if (errors.length === max) {
                reject(new Error('None of the config files could be loaded'));
            } else if (errors.length === 0) {
                resolve(results[0]);
            } else {
                resolve({
                    errors: errors,
                    result: results[0]
                });
            }
        };

        startPromise(promises[index], next);
    });
};

exports.syncPromises = syncPromises;