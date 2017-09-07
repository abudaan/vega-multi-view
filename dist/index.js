'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showSpecInTab = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _vega = require('vega');

var _vegaTooltip = require('vega-tooltip');

var _fetchHelpers = require('./util/fetch-helpers');

var _leafletVega = require('./util/leaflet-vega');

var _leafletVega2 = _interopRequireDefault(_leafletVega);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var Rx = require('rxjs/Rx');

var mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);

(0, _leafletVega2.default)();

var createLeafletVega = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, renderer) {
        var spec, view, runtime, element, signals, zoom, latitude, longitude, map;
        return regeneratorRuntime.wrap(function _callee$(_context) {
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

                        console.error('incomplete map spec');
                        return _context.abrupt('return');

                    case 8:
                        map = _leaflet2.default.map(element, {
                            zoomAnimation: false
                        }).setView([latitude.value, longitude.value], zoom.value);


                        _leaflet2.default.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                            maxZoom: 18
                        }).addTo(map);

                        _leaflet2.default.vega(view, {
                            renderer: runtime.renderer || renderer,
                            // Make sure the legend stays in place
                            delayRepaint: true
                        }).addTo(map);

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
        return new Promise(function (resolve) {
            var spec = d.spec,
                view = d.view;

            var numDataSources = spec.data.length;
            var numLoaded = 0;
            if (_ramda2.default.isNil(spec.data)) {
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

    return Promise.all(promises);
};

var loadSpec = function loadSpec(spec) {
    if (typeof spec !== 'string') {
        return spec;
    }
    return (0, _fetchHelpers.fetchJSON)(spec);
};

var loadSpecs = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(urls) {
        var specs;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        specs = [];
                        _context3.next = 3;
                        return Promise.all(urls.map(function () {
                            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
                                var spec;
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
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

    _ramda2.default.forEach(function (publish) {
        try {
            var s = new Rx.Subject();
            view.addSignalListener(publish.signal, function (name, value) {
                s.next(value);
            });
            streams[publish.as] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, runtime.publish);

    return streams;
};

var subscribeToSignal = function subscribeToSignal(data, streams) {
    var view = data.view,
        spec = data.spec,
        runtime = data.runtime;


    if (_ramda2.default.isNil(runtime.subscribe)) {
        return;
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
        s.subscribe(function (value) {
            // console.log(subscribe.as, value);
            view.signal(subscribe.as, value).run();
        });
    }, runtime.subscribe);
};

var addViews = function addViews(data, renderer) {
    data.forEach(function (d, i) {
        var view = d.view,
            runtime = d.runtime,
            element = d.element;

        if (runtime.leaflet === true) {
            createLeafletVega(d, renderer);
        } else {
            view.renderer(runtime.renderer || renderer).initialize(element);
        }
    });
};

var addTooltips = function addTooltips(data) {
    data.forEach(function (d) {
        if (typeof d.runtime.tooltipOptions !== 'undefined') {
            (0, _vegaTooltip.vega)(d.view, d.runtime.tooltipOptions);
        }
    });
};

var connectSignals = function connectSignals(data) {
    var streams = {};
    _ramda2.default.forEach(function (d) {
        streams = _extends({}, streams, publishSignal(d));
    }, _ramda2.default.values(data));

    _ramda2.default.forEach(function (d) {
        subscribeToSignal(d, streams);
    }, _ramda2.default.values(data));
};

var addElements = function addElements(data, container, className) {
    return _ramda2.default.map(function (d) {
        var element = d.runtime.element;
        if (element === false) {
            // headless rendering
            element = null;
        } else if (_ramda2.default.isNil(element) === false) {
            if (typeof element === 'string') {
                element = document.getElementById(d.runtime.element);
                if (_ramda2.default.isNil(element)) {
                    console.error('element "' + d.runtime.element + '" could not be found');
                    return _extends({}, d, {
                        element: null
                    });
                }
            } else if (element instanceof HTMLElement !== true) {
                console.error('element "' + d.runtime.element + '" is not a valid HTMLElement');
                return _extends({}, d, {
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
        }
        if (element !== null) {
            element.style.width = d.spec.width + 'px';
            element.style.height = d.spec.height + 'px';
            container.appendChild(element);
        }
        return _extends({}, d, {
            element: element
        });
    }, data);
};

var createSpecData = function createSpecData(specs, runtimes) {
    var promises = mapIndexed(function () {
        var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(s, i) {
            var spec, id, runtime, specClone, view;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return loadSpec(s);

                        case 2:
                            spec = _context4.sent;
                            id = 'spec_' + i;
                            runtime = {};
                            specClone = _extends({}, spec);

                            if (typeof specClone.runtime !== 'undefined') {
                                runtime = _extends({}, specClone.runtime);
                                delete specClone.runtime;
                            } else if (_ramda2.default.isNil(runtimes[i]) === false) {
                                runtime = runtimes[i];
                            }
                            view = new _vega.View((0, _vega.parse)(specClone));
                            return _context4.abrupt('return', new Promise(function (resolve) {
                                resolve({
                                    id: id,
                                    spec: specClone,
                                    view: view,
                                    runtime: runtime
                                });
                            }));

                        case 9:
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
    return Promise.all(promises);
};

var createViews = function () {
    var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(config) {
        var _config$container, container, specs, _config$className, className, runtimes, _config$renderer, renderer, _config$debug, debug, data;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        _config$container = config.container, container = _config$container === undefined ? document.body : _config$container, specs = config.specs;
                        _config$className = config.className, className = _config$className === undefined ? false : _config$className, runtimes = config.runtimes, _config$renderer = config.renderer, renderer = _config$renderer === undefined ? 'canvas' : _config$renderer, _config$debug = config.debug, debug = _config$debug === undefined ? true : _config$debug;


                        if (_ramda2.default.isNil(container)) {
                            container = document.body;
                        }

                        if (_ramda2.default.isArrayLike(specs) === false) {
                            specs = [specs];
                        }

                        _context5.next = 6;
                        return createSpecData(specs, runtimes);

                    case 6:
                        data = _context5.sent;

                        data = addElements(data, container, className);
                        addTooltips(data);
                        connectSignals(data);

                        if (!debug) {
                            _context5.next = 13;
                            break;
                        }

                        _context5.next = 13;
                        return addDebug(data);

                    case 13:
                        return _context5.abrupt('return', new Promise(function (resolve) {
                            // wait until the next paint cycle so the created elements
                            // are added to the DOM, add the viewsm, then resolve
                            setTimeout(function () {
                                addViews(data, renderer);
                                resolve({
                                    data: data
                                });
                            }, 0);
                        }));

                    case 14:
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
    var json = JSON.stringify(spec, null, 4);
    var w = window.open();
    w.document.open();
    w.document.write('<html><body><pre>' + json + '</pre></body></html>');
    w.document.close();
};

exports.default = createViews;