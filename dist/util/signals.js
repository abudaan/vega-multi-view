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

var _process = require('./process');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var streamId = 0; // @no-flow

var streams = {};
var logDebugMessages = false;

var publishSignal = function publishSignal(data) {
    var vmvConfig = data.vmvConfig,
        view = data.view;


    if (_ramda2.default.isNil(vmvConfig.publish)) {
        return streams;
    }

    var publishes = vmvConfig.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    _ramda2.default.forEach(function (publish) {
        var alias = publish.as || publish.signal;
        if (_ramda2.default.isNil(streams[alias]) === false) {
            console.error('There is already a stream published as "' + alias + '", skipping this one. Please use another name or unpublish this signal first');
        } else {
            try {
                var s = _xstream2.default.create({
                    start: function start(listener) {
                        view.addSignalListener(publish.signal, function (name, value) {
                            listener.next({ query: publish.query, value: value });
                        });
                    },
                    stop: function stop() {
                        view.removeSignalListener(publish.signal);
                    },

                    id: streamId
                });
                streamId += 1;
                if (logDebugMessages) {
                    console.log('publishing signal ' + publish.signal + ' as ' + alias + ' with stream id ' + streamId);
                }
                streams[alias] = s;
            } catch (e) {
                console.error(e.message);
            }
        }
    }, publishes);
    return streams;
};

var subscribeToSignal = function subscribeToSignal(data) {
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
        s.addListener({
            next: function next(d) {
                var query = d.query,
                    value = d.value;

                var action = null;
                if (query) {
                    action = query.action;
                }
                if (action === 'replace_all' || action === 'replaceAll') {
                    (0, _process.replaceDataset)(view, query, value);
                } else if (action === 'remove_all' || action === 'removeAll') {
                    (0, _process.removeDataset)(view, query, value);
                } else if (action === 'change') {
                    (0, _process.change)(view, query, value);
                } else if (action === 'remove') {
                    (0, _process.remove)(view, query, value);
                } else if (action === 'insert') {
                    (0, _process.insert)(view, query, value);
                } else {
                    // if (R.isEmpty(value) === false) {
                    var signalName = subscribe.as || subscribe.signal;
                    if (_ramda2.default.isNil(_ramda2.default.find(_ramda2.default.propEq('name', signalName))(spec.signals))) {
                        console.error('no signal "' + signalName + '" found in spec');
                    } else {
                        view.signal(signalName, value).run();
                    }
                }
            },
            error: function error(err) {
                console.error('Stream ' + s.id + ' error: ' + err);
            },
            complete: function complete() {
                console.log('Stream ' + s.id + ' is done');
            }
        });
    }, subscribes);
};

var connectSignals = function connectSignals(data, debug) {
    logDebugMessages = debug;
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
    // console.log(streams);
};

exports.default = connectSignals;