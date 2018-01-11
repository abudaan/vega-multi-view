'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @no-flow
var streamId = 0;

var publishSignal = function publishSignal(data) {
    var vmvConfig = data.vmvConfig,
        view = data.view;

    var streams = {};

    if (_ramda2.default.isNil(vmvConfig.publish)) {
        return streams;
    }

    var publishes = vmvConfig.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    _ramda2.default.forEach(function (publish) {
        // console.log(publish);
        try {
            var s = _xstream2.default.create({
                start: function start(listener) {
                    view.addSignalListener(publish.signal, function (name, value) {
                        listener.next(value);
                    });
                },
                stop: function stop() {
                    view.removeSignalListener(publish.signal);
                },


                id: streamId
            });
            streamId += 1;
            streams[publish.as || publish.signal] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, publishes);

    return streams;
};

var subscribeToSignal = function subscribeToSignal(data, streams) {
    var view = data.view,
        spec = data.spec,
        vmvConfig = data.vmvConfig;


    if (_ramda2.default.isNil(vmvConfig.subscribe)) {
        return;
    }

    var subscribes = vmvConfig.subscribe;
    if (Array.isArray(subscribes) === false) {
        subscribes = [subscribes];
    }

    _ramda2.default.forEach(function (subscribe) {
        var s = streams[subscribe.signal];
        if (_ramda2.default.isNil(s)) {
            console.error('no stream for signal "' + subscribe.signal + '"');
            return;
        }

        if (subscribe.dataUpdate === true) {
            s.addListener({
                next: function next(value) {
                    if (_ramda2.default.isNil(value) === false) {
                        // TODO: validation here!
                        view.remove(value.name, function () {
                            return true;
                        }).run();
                        view.insert(value.name, value.values).run();
                    }
                },
                error: function error(err) {
                    console.error('Stream ' + s.id + ' error: ' + err);
                },
                complete: function complete() {
                    console.log('Stream ' + s.id + ' is done');
                }
            });
        } else {
            if (_ramda2.default.isNil(_ramda2.default.find(_ramda2.default.propEq('name', subscribe.as))(spec.signals))) {
                console.error('no signal "' + subscribe.as + '" found in spec');
                return;
            }

            s.addListener({
                next: function next(value) {
                    console.log(value);
                    view.signal(subscribe.as, value).run();
                },
                error: function error(err) {
                    console.error('Stream ' + s.id + ' error: ' + err);
                },
                complete: function complete() {
                    console.log('Stream ' + s.id + ' is done');
                }
            });
        }
    }, subscribes);
};

var connectSignals = function connectSignals(data) {
    var streams = {};
    _ramda2.default.forEach(function (d) {
        if (d.view !== null) {
            streams = (0, _extends3.default)({}, streams, publishSignal(d));
        }
    }, _ramda2.default.values(data));

    _ramda2.default.forEach(function (d) {
        if (d.view !== null) {
            subscribeToSignal(d, streams);
        }
    }, _ramda2.default.values(data));
};

exports.default = connectSignals;