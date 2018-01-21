'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _loadSpecs = require('./load-specs');

var _index = require('../index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);

exports.default = function (store, specs, overwrite, type) {
    var specsArray = void 0;

    var _R$splitWhen = _ramda2.default.splitWhen(function (key) {
        return _ramda2.default.isNil(store[key]);
    }, _ramda2.default.keys(specs)),
        _R$splitWhen2 = (0, _slicedToArray3.default)(_R$splitWhen, 2),
        inStore = _R$splitWhen2[0],
        outStore = _R$splitWhen2[1];

    if (overwrite) {
        (0, _index.removeViews)(inStore);
        if (inStore.length === 1) {
            console.info('view with id "' + inStore[0] + '" is overwritten');
        } else if (inStore.length > 1) {
            console.info('views with ids "' + inStore.join('", "') + '" are overwritten');
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

        // check if a view specific vmv config has been provided
        if (Array.isArray(s)) {
            if (s.length === 2) {
                var _s = (0, _slicedToArray3.default)(s, 2);

                data.spec = _s[0];
                data.vmvConfig = _s[1];
            } else if (s.length === 1) {
                var _s2 = (0, _slicedToArray3.default)(s, 1);

                data.spec = _s2[0];
            }
        }

        return data;
    }, specsArray);

    var promises = mapIndexed(function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
            var spec, t, specClone, vmvConfig;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            spec = null;
                            _context.prev = 1;
                            t = data.spec.type || type;
                            _context.next = 5;
                            return (0, _loadSpecs.loadSpec)(data.spec, t);

                        case 5:
                            spec = _context.sent;
                            _context.next = 11;
                            break;

                        case 8:
                            _context.prev = 8;
                            _context.t0 = _context['catch'](1);

                            console.error(_context.t0);

                        case 11:
                            if (!(spec === null)) {
                                _context.next = 13;
                                break;
                            }

                            return _context.abrupt('return', _promise2.default.resolve({
                                id: data.id,
                                spec: 'Vega spec ' + data.spec + ' could not be loaded',
                                vmvConfig: null
                            }));

                        case 13:
                            specClone = (0, _extends3.default)({}, spec);
                            vmvConfig = data.vmvConfig || { styling: {} };

                            if (_ramda2.default.isNil(specClone.vmvConfig) === false) {
                                vmvConfig = (0, _extends3.default)({}, specClone.vmvConfig);
                                delete specClone.vmvConfig;
                            }
                            if (_ramda2.default.isNil(vmvConfig.styling)) {
                                vmvConfig.styling = {};
                            }
                            return _context.abrupt('return', new _promise2.default(function (resolve) {
                                resolve({
                                    id: data.id,
                                    spec: specClone,
                                    vmvConfig: vmvConfig
                                });
                            }));

                        case 18:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined, [[1, 8]]);
        }));

        return function (_x) {
            return _ref.apply(this, arguments);
        };
    }(), specsArray);
    return _promise2.default.all(promises);
};