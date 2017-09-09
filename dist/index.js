'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showSpecInTab = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _xstream = require('xstream');

var _xstream2 = _interopRequireDefault(_xstream);

var _leaflet = require('leaflet');

var _vega = require('vega');

var _vegaTooltip = require('vega-tooltip');

var _fetchHelpers = require('./util/fetch-helpers');

var _leafletVega = require('./util/leaflet-vega');

var _leafletVega2 = _interopRequireDefault(_leafletVega);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);
var streamId = 0;

var createLeafletVega = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data, renderer) {
        var spec, view, runtime, element, signals, zoom, latitude, longitude, leafletMap;
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        spec = data.spec, view = data.view, runtime = data.runtime, element = data.element;
                        signals = spec.signals || [];
                        zoom = _ramda2.default.find(_ramda2.default.propEq('name', 'zoom'))(signals);
                        latitude = _ramda2.default.find(_ramda2.default.propEq('name', 'latitude'))(signals);
                        longitude = _ramda2.default.find(_ramda2.default.propEq('name', 'longitude'))(signals);

                        if (!(_ramda2.default.isNil(zoom) || _ramda2.default.isNil(latitude) || _ramda2.default.isNil(longitude))) {
                            _context.next = 8;
                            break;
                        }

                        console.error('incomplete map spec; if you want to add Vega as a Leaflet layer you should provide signals for zoom, latitude and longitude');
                        return _context.abrupt('return');

                    case 8:
                        leafletMap = new _leaflet.Map(element, {
                            zoomAnimation: false
                        }).setView([latitude.value, longitude.value], zoom.value);


                        new _leaflet.TileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                            maxZoom: 18
                        }).addTo(leafletMap);

                        new _leafletVega2.default(view, {
                            renderer: runtime.renderer || renderer,
                            // Make sure the legend stays in place
                            delayRepaint: true
                        }).addTo(leafletMap);

                    case 11:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function createLeafletVega(_x, _x2) {
        return _ref.apply(this, arguments);
    };
}();

var addDebug = function addDebug(datas) {
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

            var numDataSources = spec.data.length;
            var numLoaded = 0;
            if (_ramda2.default.isNil(spec.data) || spec.data.length === 0) {
                resolve();
            }
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

var loadSpec = function loadSpec(spec) {
    if (typeof spec !== 'string') {
        return _promise2.default.resolve(spec);
    }
    return (0, _fetchHelpers.fetchJSON)(spec).then(function (data) {
        return data;
    }, function () {
        return null;
    }).catch(function () {
        return null;
    });
};

var loadSpecs = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(urls) {
        var specs;
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        specs = [];
                        _context3.next = 3;
                        return _promise2.default.all(urls.map(function () {
                            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(url) {
                                var spec;
                                return _regenerator2.default.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return (0, _fetchHelpers.fetchJSON)(url);

                                            case 2:
                                                spec = _context2.sent;

                                                specs.push(spec);

                                            case 4:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, undefined);
                            }));

                            return function (_x4) {
                                return _ref3.apply(this, arguments);
                            };
                        }()));

                    case 3:
                        return _context3.abrupt('return', specs);

                    case 4:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined);
    }));

    return function loadSpecs(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

var publishSignal = function publishSignal(data) {
    var runtime = data.runtime,
        view = data.view;

    var streams = {};

    if (_ramda2.default.isNil(runtime.publish)) {
        return streams;
    }

    var publishes = runtime.publish;
    if (Array.isArray(publishes) === false) {
        publishes = [publishes];
    }

    _ramda2.default.forEach(function (publish) {
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
            streams[publish.as] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, publishes);

    return streams;
};

var subscribeToSignal = function subscribeToSignal(data, streams) {
    var view = data.view,
        spec = data.spec,
        runtime = data.runtime;


    if (_ramda2.default.isNil(runtime.subscribe)) {
        return;
    }

    var subscribes = runtime.subscribe;
    if (Array.isArray(subscribes) === false) {
        subscribes = [subscribes];
    }

    _ramda2.default.forEach(function (subscribe) {
        var s = streams[subscribe.signal];
        if (_ramda2.default.isNil(s)) {
            console.error('no stream for signal "' + subscribe.signal + '"');
            return;
        }
        if (_ramda2.default.isNil(_ramda2.default.find(_ramda2.default.propEq('name', subscribe.as))(spec.signals))) {
            console.error('no signal "' + subscribe.as + '" found in spec');
            return;
        }

        s.addListener({
            next: function next(value) {
                view.signal(subscribe.as, value).run();
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

var addViews = function addViews(data, renderer) {
    data.forEach(function (d, i) {
        var view = d.view,
            runtime = d.runtime,
            element = d.element;

        if (view !== null) {
            if (runtime.leaflet === true) {
                createLeafletVega(d, renderer);
            } else {
                view.renderer(runtime.renderer || renderer).initialize(element);
            }
        }
    });
};

var addTooltips = function addTooltips(data) {
    data.forEach(function (d) {
        if (d.view !== null && typeof d.runtime.tooltipOptions !== 'undefined') {
            (0, _vegaTooltip.vega)(d.view, d.runtime.tooltipOptions);
        }
    });
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

var addElements = function addElements(data, container, className) {
    return _ramda2.default.map(function (d) {
        if (d.view === null) {
            return (0, _extends3.default)({}, d, {
                element: null
            });
        }
        var element = d.runtime.element;
        if (element === false) {
            // headless rendering
            element = null;
        } else if (_ramda2.default.isNil(element) === false) {
            if (typeof element === 'string') {
                element = document.getElementById(d.runtime.element);
                if (_ramda2.default.isNil(element)) {
                    console.error('element "' + d.runtime.element + '" could not be found');
                    return (0, _extends3.default)({}, d, {
                        element: null
                    });
                }
            } else if (element instanceof HTMLElement !== true) {
                console.error('element "' + d.runtime.element + '" is not a valid HTMLElement');
                return (0, _extends3.default)({}, d, {
                    element: null
                });
            }
        } else {
            element = document.createElement('div');
            element.id = d.id;
            if (typeof d.className === 'string') {
                element.className = d.className;
            } else if (typeof className === 'string') {
                element.className = className;
            }
            element.style.width = d.spec.width + 'px';
            element.style.height = d.spec.height + 'px';
            if (container !== null) {
                container.appendChild(element);
            } else {
                console.warn('could not add Vega view: HTML container element is null');
            }
        }

        return (0, _extends3.default)({}, d, {
            element: element
        });
    }, data);
};

var createSpecData = function createSpecData(specs, runtimes) {
    var promises = mapIndexed(function () {
        var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(s, i) {
            var spec, id, runtime, specClone, view;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return loadSpec(s);

                        case 2:
                            spec = _context4.sent;
                            id = 'spec_' + i;

                            if (!(spec === null)) {
                                _context4.next = 6;
                                break;
                            }

                            return _context4.abrupt('return', _promise2.default.resolve({
                                id: id,
                                spec: 'Vega spec ' + s + ' could not be loaded',
                                view: null,
                                runtime: null
                            }));

                        case 6:
                            runtime = {};
                            specClone = (0, _extends3.default)({}, spec);

                            if (_ramda2.default.isNil(specClone.runtime) === false) {
                                runtime = (0, _extends3.default)({}, specClone.runtime);
                                delete specClone.runtime;
                            } else if (_ramda2.default.isNil(runtimes[i]) === false) {
                                runtime = runtimes[i];
                            }
                            view = new _vega.View((0, _vega.parse)(specClone));
                            return _context4.abrupt('return', new _promise2.default(function (resolve) {
                                resolve({
                                    id: id,
                                    spec: specClone,
                                    view: view,
                                    runtime: runtime
                                });
                            }));

                        case 11:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, undefined);
        }));

        return function (_x5, _x6) {
            return _ref4.apply(this, arguments);
        };
    }(), specs);
    return _promise2.default.all(promises);
};

var createViews = function () {
    var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(config) {
        var _config$run, run, specs, element, _config$className, className, _config$runtimes, runtimes, _config$renderer, renderer, _config$debug, debug, specsArray, containerElement, data;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _config$run = config.run, run = _config$run === undefined ? true : _config$run, specs = config.specs, element = config.element, _config$className = config.className, className = _config$className === undefined ? false : _config$className, _config$runtimes = config.runtimes, runtimes = _config$runtimes === undefined ? [] : _config$runtimes, _config$renderer = config.renderer, renderer = _config$renderer === undefined ? 'canvas' : _config$renderer, _config$debug = config.debug, debug = _config$debug === undefined ? false : _config$debug;
                        specsArray = specs;
                        containerElement = null;

                        if (!_ramda2.default.isNil(element)) {
                            _context5.next = 7;
                            break;
                        }

                        containerElement = document.body;
                        _context5.next = 15;
                        break;

                    case 7:
                        if (!(typeof element === 'string')) {
                            _context5.next = 14;
                            break;
                        }

                        containerElement = document.getElementById(element);

                        if (!_ramda2.default.isNil(containerElement)) {
                            _context5.next = 12;
                            break;
                        }

                        console.error('element "' + element + '" could not be found');
                        return _context5.abrupt('return', _promise2.default.reject('element "' + element + '" could not be found'));

                    case 12:
                        _context5.next = 15;
                        break;

                    case 14:
                        if (element instanceof HTMLElement) {
                            containerElement = element;
                        }

                    case 15:
                        if (_ramda2.default.isArrayLike(specsArray) === false) {
                            specsArray = [specsArray];
                        }

                        _context5.next = 18;
                        return createSpecData(specsArray, runtimes);

                    case 18:
                        data = _context5.sent;

                        data = addElements(data, containerElement, className);
                        addTooltips(data);
                        connectSignals(data);

                        if (!debug) {
                            _context5.next = 25;
                            break;
                        }

                        _context5.next = 25;
                        return addDebug(data);

                    case 25:
                        return _context5.abrupt('return', new _promise2.default(function (resolve) {
                            // wait until the next paint cycle so the created elements
                            // are added to the DOM, add the views, then resolve
                            setTimeout(function () {
                                addViews(data, renderer);
                                data.forEach(function (d) {
                                    if (d.view !== null && (d.runtime.run === true || run === true && d.runtime.run !== false)) {
                                        d.view.run();
                                    }
                                });
                                resolve(data);
                            }, 0);
                        }));

                    case 26:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, undefined);
    }));

    return function createViews(_x7) {
        return _ref5.apply(this, arguments);
    };
}();

var showSpecInTab = exports.showSpecInTab = function showSpecInTab(spec) {
    // const json = encodeURIComponent(JSON.stringify(TestSpec4));
    // window.open(`data:application/json, ${json}`, '_blank');
    var json = (0, _stringify2.default)(spec, null, 4);
    var w = window.open();
    w.document.open();
    w.document.write('<html><body><pre>' + json + '</pre></body></html>');
    w.document.close();
};

exports.default = createViews;