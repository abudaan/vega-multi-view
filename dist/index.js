'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.vega = exports.version = exports.showSpecInTab = exports.addMultipleConfigs = exports.addViews = exports.removeViews = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _vega = require('vega');

var vega = _interopRequireWildcard(_vega);

var _dist = require('vega-as-leaflet-layer/dist');

var _dist2 = _interopRequireDefault(_dist);

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

var _createSpecData = require('./util/create-spec-data');

var _createSpecData2 = _interopRequireDefault(_createSpecData);

var _promiseHelpers = require('./util/promise-helpers');

var _package = require('../package.json');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = {};

var renderViews = function renderViews(data, renderer, container) {
    data.forEach(function (d) {
        var view = d.view,
            vmvConfig = d.vmvConfig,
            element = d.element;

        if (view !== null) {
            if (vmvConfig.leaflet === true) {
                // console.log('element', element);
                // console.log('container', container);
                var config = {
                    view: d.view,
                    renderer: d.renderer || renderer,
                    // container,
                    container: element
                };
                (0, _dist2.default)(config);
            } else {
                view.renderer(vmvConfig.renderer || renderer).initialize(element);
            }
        }
    });
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
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(cfg) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

        var config, _config, _config$run, run, _config$hover, hover, specs, element, _config$renderer, renderer, _config$debug, debug, _config$overwrite, overwrite, _config$styling, styling, containerElement, data;

        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        config = cfg;

                        if (!(typeof config === 'string')) {
                            _context.next = 13;
                            break;
                        }

                        if (!(config.length === 0)) {
                            _context.next = 4;
                            break;
                        }

                        return _context.abrupt('return', _promise2.default.reject(new Error('You have passed an empty string!')));

                    case 4:
                        _context.prev = 4;
                        _context.next = 7;
                        return (0, _fetchHelpers.load)(config, type).catch(function (e) {
                            return _promise2.default.reject(e);
                        });

                    case 7:
                        config = _context.sent;
                        _context.next = 13;
                        break;

                    case 10:
                        _context.prev = 10;
                        _context.t0 = _context['catch'](4);
                        return _context.abrupt('return', _promise2.default.reject(_context.t0));

                    case 13:

                        // console.log(config);
                        _config = config, _config$run = _config.run, run = _config$run === undefined ? true : _config$run, _config$hover = _config.hover, hover = _config$hover === undefined ? false : _config$hover, specs = _config.specs, element = _config.element, _config$renderer = _config.renderer, renderer = _config$renderer === undefined ? 'canvas' : _config$renderer, _config$debug = _config.debug, debug = _config$debug === undefined ? false : _config$debug, _config$overwrite = _config.overwrite, overwrite = _config$overwrite === undefined ? false : _config$overwrite, _config$styling = _config.styling, styling = _config$styling === undefined ? {} : _config$styling;

                        // add global styling

                        (0, _addStyling2.default)('global', styling, document.body);

                        // set up the containing HTML element, defaults to document.body
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
                            // check if the element has been added to the DOM
                            if (document.getElementById(element.id) === null) {
                                document.body.appendChild(containerElement);
                            }
                        } else if (typeof element !== 'undefined') {
                            console.warn('invalid element, using document.body instead');
                        }

                        // parse all views
                        _context.next = 19;
                        return (0, _createSpecData2.default)(store, specs, overwrite, type);

                    case 19:
                        data = _context.sent;

                        data = (0, _addElements2.default)(data, containerElement);
                        (0, _addTooltips2.default)(data);
                        (0, _signals2.default)(data, debug);

                        if (!debug) {
                            _context.next = 26;
                            break;
                        }

                        _context.next = 26;
                        return (0, _debug2.default)(data);

                    case 26:
                        return _context.abrupt('return', new _promise2.default(function (resolve) {
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
                                    }
                                    // add view specific styling
                                    (0, _addStyling2.default)(d.id, d.vmvConfig.styling, d.element, styling);
                                    // store view so we can remove or edit it after initialization
                                    store[d.id] = d;
                                });
                                resolve(store);
                            }, 10);
                        }));

                    case 27:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined, [[4, 10]]);
    }));

    return function addViews(_x2) {
        return _ref.apply(this, arguments);
    };
}();

var addMultipleConfigs = exports.addMultipleConfigs = function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(configs) {
        var promises;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!(Array.isArray(configs) === false)) {
                            _context2.next = 2;
                            break;
                        }

                        return _context2.abrupt('return', _promise2.default.reject(new Error('Please pass an array with urls to config files!')));

                    case 2:
                        promises = [];

                        configs.forEach(function (config) {
                            promises.push({
                                func: addViews,
                                args: [config]
                            });
                        });
                        return _context2.abrupt('return', (0, _promiseHelpers.syncPromises)(promises));

                    case 5:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function addMultipleConfigs(_x3) {
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

var v = 'vega-multi-view ' + _package.version;
exports.version = v;
exports.vega = vega;