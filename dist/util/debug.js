'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addDebug = function addDebug(datas) {
    // console.log(datas);
    _ramda2.default.forEach(function (d) {
        var spec = d.spec,
            view = d.view;


        _ramda2.default.forEach(function (signal) {
            view.addSignalListener(signal.name, function (signalName, signalData) {
                console.log('[SIGNAL] %s %s %O', spec.description || ' - ', signalName, signalData);
            });
        }, spec.signals || []);
    }, datas);

    var promises = _ramda2.default.map(function (d) {
        return new _promise2.default(function (resolve) {
            var spec = d.spec,
                view = d.view;

            if (_ramda2.default.isNil(spec.data) || spec.data.length === 0) {
                resolve();
            }
            var numDataSources = spec.data.length;
            var numLoaded = 0;
            var dataPoller = setInterval(function () {
                _ramda2.default.forEach(function (data) {
                    var loaded = view.data(data.name);
                    if (loaded !== null) {
                        console.log('[DATA] %s %s %O', spec.description || ' - ', data.name, loaded);
                        numLoaded += 1;
                    }
                    if (numLoaded === numDataSources) {
                        // console.log('all data loaded');
                        clearInterval(dataPoller);
                        resolve();
                    }
                }, spec.data);
            }, 10);
        });
    }, datas);

    return _promise2.default.all(promises);
};

exports.default = addDebug;