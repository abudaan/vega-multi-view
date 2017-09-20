'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showSpecInTab = exports.addViews = exports.removeViews = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _vega = require('vega');

var _vegaAsLeafletLayer = require('vega-as-leaflet-layer');

var _vegaAsLeafletLayer2 = _interopRequireDefault(_vegaAsLeafletLayer);

var _fetchHelpers = require('fetch-helpers');

var _debug = require('./util/debug');

var _debug2 = _interopRequireDefault(_debug);

var _addTooltips = require('./util/add-tooltips');

var _addTooltips2 = _interopRequireDefault(_addTooltips);

var _signals = require('./util/signals');

var _signals2 = _interopRequireDefault(_signals);

var _addElements = require('./util/add-elements');

var _addElements2 = _interopRequireDefault(_addElements);

var _addStyling = require('./util/add-styling');

var _addStyling2 = _interopRequireDefault(_addStyling);

var _loadSpecs = require('./util/load-specs');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);
var firstRun = true;
var store = {};
var VERSION = '1.1.2';

var renderViews = function renderViews(data, renderer, container) {
    data.forEach(function (d) {
        var view = d.view,
            vmvConfig = d.vmvConfig,
            element = d.element;

        if (view !== null) {
            if (vmvConfig.leaflet === true) {
                var config = {
                    view: d.view,
                    renderer: d.renderer || renderer,
                    container: container,
                    mapElement: element
                };
                (0, _vegaAsLeafletLayer2.default)(config);
            } else {
                view.renderer(vmvConfig.renderer || renderer).initialize(element);
            }
        }
    });
};

var createSpecData = function createSpecData(specs, type) {
    var promises = mapIndexed(function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
            var spec, specClone, vmvConfig, view;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            spec = null;
                            _context.prev = 1;
                            _context.next = 4;
                            return (0, _loadSpecs.loadSpec)(data.spec, type);

                        case 4:
                            spec = _context.sent;
                            _context.next = 10;
                            break;

                        case 7:
                            _context.prev = 7;
                            _context.t0 = _context['catch'](1);

                            console.error(_context.t0);

                        case 10:
                            if (!(spec === null)) {
                                _context.next = 12;
                                break;
                            }

                            return _context.abrupt('return', _promise2.default.resolve({
                                id: data.id,
                                spec: 'Vega spec ' + data.spec + ' could not be loaded',
                                view: null,
                                vmvConfig: null
                            }));

                        case 12:
                            specClone = (0, _extends3.default)({}, spec);
                            vmvConfig = data.vmvConfig || { styling: {} };

                            if (_ramda2.default.isNil(specClone.vmvConfig) === false) {
                                vmvConfig = (0, _extends3.default)({}, specClone.vmvConfig);
                                delete specClone.vmvConfig;
                            }
                            if (_ramda2.default.isNil(vmvConfig.styling)) {
                                vmvConfig.styling = {};
                            }
                            view = new _vega.View((0, _vega.parse)(specClone));
                            return _context.abrupt('return', new _promise2.default(function (resolve) {
                                resolve({
                                    id: data.id,
                                    spec: specClone,
                                    view: view,
                                    vmvConfig: vmvConfig
                                });
                            }));

                        case 18:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined, [[1, 7]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }(), specs);
    return _promise2.default.all(promises);
};

var removeViews = exports.removeViews = function removeViews() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    var ids = _ramda2.default.flatten(args);
    // console.log(ids);
    ids.forEach(function (id) {
        var data = store[id];
        if (_ramda2.default.isNil(data) === false) {
            var elem = data.element;
            if (elem !== null) {
                elem.parentNode.removeChild(elem);
            }
            delete store[id];
        }
    });
    return store;
};

var addViews = exports.addViews = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(cfg) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var config, _config, _config$run, run, _config$hover, hover, specs, element, _config$renderer, renderer, _config$debug, debug, _config$overwrite, overwrite, _config$styling, styling, specsArray, _R$splitWhen, _R$splitWhen2, inStore, outStore, containerElement, data;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (firstRun === true) {
                            console.log('vega- multi - view ' + VERSION + ' ');
                            firstRun = false;
                        }

                        config = cfg;

                        if (!(typeof config === 'string')) {
                            _context2.next = 12;
                            break;
                        }

                        _context2.prev = 3;
                        _context2.next = 6;
                        return (0, _fetchHelpers.load)(config);

                    case 6:
                        config = _context2.sent;
                        _context2.next = 12;
                        break;

                    case 9:
                        _context2.prev = 9;
                        _context2.t0 = _context2['catch'](3);

                        console.error(_context2.t0);

                    case 12:
                        _config = config, _config$run = _config.run, run = _config$run === undefined ? true : _config$run, _config$hover = _config.hover, hover = _config$hover === undefined ? false : _config$hover, specs = _config.specs, element = _config.element, _config$renderer = _config.renderer, renderer = _config$renderer === undefined ? 'canvas' : _config$renderer, _config$debug = _config.debug, debug = _config$debug === undefined ? false : _config$debug, _config$overwrite = _config.overwrite, overwrite = _config$overwrite === undefined ? false : _config$overwrite, _config$styling = _config.styling, styling = _config$styling === undefined ? {} : _config$styling;


                        (0, _addStyling2.default)('global', styling, document.body);

                        specsArray = void 0;
                        _R$splitWhen = _ramda2.default.splitWhen(function (key) {
                            return _ramda2.default.isNil(store[key]);
                        }, _ramda2.default.keys(specs)), _R$splitWhen2 = (0, _slicedToArray3.default)(_R$splitWhen, 2), inStore = _R$splitWhen2[0], outStore = _R$splitWhen2[1];


                        if (overwrite) {
                            removeViews(inStore);
                            if (inStore.length === 1) {
                                console.info('view with id "' + inStore[0] + '" is overwritten');
                            } else if (inStore.length > 1) {
                                console.info('views with ids "' + inStore.join('", "') + '" is overwritten');
                            }
                            specsArray = _ramda2.default.keys(specs);
                        } else {
                            if (inStore.length === 1) {
                                console.warn('view with id "' + inStore[0] + '" already exist!');
                            } else if (inStore.length > 1) {
                                console.warn('views with ids "' + inStore.join('", "') + '" already exist!');
                            }
                            specsArray = outStore;
                        }

                        specsArray = _ramda2.default.map(function (key) {
                            var s = specs[key];
                            var data = {
                                spec: s,
                                id: key
                            };
                            if (Array.isArray(s) && s.length === 2) {
                                var _s = (0, _slicedToArray3.default)(s, 2);

                                data.spec = _s[0];
                                data.vmvConfig = _s[1];
                            }
                            return data;
                        }, specsArray);

                        // default to document.body
                        containerElement = document.body;

                        if (typeof element === 'string') {
                            containerElement = document.getElementById(element);
                            if (_ramda2.default.isNil(containerElement)) {
                                containerElement = document.createElement('div');
                                containerElement.id = element;
                                document.body.appendChild(containerElement);
                                // console.error(`element "${element}" could not be found`);
                                // return Promise.reject(`element "${element}" could not be found`);
                            }
                        } else if (element instanceof HTMLElement) {
                            containerElement = element;
                            if (document.getElementById(element) === null) {
                                document.body.appendChild(containerElement);
                            }
                        } else if (typeof element !== 'undefined') {
                            console.warn('invalid element, using document.body instead');
                        }

                        _context2.next = 22;
                        return createSpecData(specsArray, type);

                    case 22:
                        data = _context2.sent;

                        data = (0, _addElements2.default)(data, containerElement);
                        (0, _addTooltips2.default)(data);
                        (0, _signals2.default)(data);

                        if (!debug) {
                            _context2.next = 29;
                            break;
                        }

                        _context2.next = 29;
                        return (0, _debug2.default)(data);

                    case 29:
                        return _context2.abrupt('return', new _promise2.default(function (resolve) {
                            // wait until the next paint cycle so the created elements
                            // are added to the DOM, add the views, then resolve
                            setTimeout(function () {
                                renderViews(data, renderer, containerElement);
                                data.forEach(function (d) {
                                    if (d.view !== null) {
                                        if (d.vmvConfig.run === true || run === true && d.vmvConfig.run !== false) {
                                            d.view.run();
                                        }
                                        if (d.vmvConfig.hover === true || hover === true && d.vmvConfig.hover !== false) {
                                            d.view.hover();
                                        }
                                        (0, _addStyling2.default)(d.id, d.vmvConfig.styling, d.element, styling);
                                    }
                                    store[d.id] = d;
                                });
                                resolve(store);
                            }, 0);
                        }));

                    case 30:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined, [[3, 9]]);
    }));

    return function addViews(_x3) {
        return _ref2.apply(this, arguments);
    };
}();

/*
    credits: https://stackoverflow.com/questions/27705640/display-json-in-a-readable-format-in-a-new-tab
*/
var showSpecInTab = exports.showSpecInTab = function showSpecInTab(spec) {
    // const json = encodeURIComponent(JSON.stringify(TestSpec4));
    // window.open(`data: application / json, ${json } `, '_blank');
    var json = (0, _stringify2.default)(spec, null, 4);
    var w = window.open();
    w.document.open();
    w.document.write('< html > <body><pre>' + json + '</pre></body></html > ');
    w.document.close();
};