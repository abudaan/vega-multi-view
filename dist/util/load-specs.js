'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadSpecs = exports.loadSpec = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _fetchHelpers = require('./fetch-helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadSpec = exports.loadSpec = function loadSpec(spec, type) {
    var t = type;
    var json = void 0;
    if (t === null) {
        if (typeof spec !== 'string') {
            t = 'object';
        } else if (spec.search(/.ya?ml/) !== -1) {
            t = 'yaml';
        } else if (spec.search(/.json/) !== -1) {
            t = 'json';
        } else if (spec.search(/.bson/) !== -1) {
            t = 'bson';
        } else if (spec.search(/.cson/) !== -1) {
            t = 'cson';
        } else {
            try {
                json = JSON.parse(spec);
                t = 'json_string';
            } catch (e) {
                t = null;
            }
        }
    }

    if (t === 'object') {
        return _promise2.default.resolve(spec);
    }
    if (t === 'json_string') {
        return _promise2.default.resolve(json);
    }
    if (t === 'json') {
        return (0, _fetchHelpers.fetchJSON)(spec).then(function (data) {
            return data;
        }, function () {
            return null;
        }).catch(function () {
            return null;
        });
    }
    if (t === 'yaml') {
        return (0, _fetchHelpers.fetchYAML)(spec).then(function (data) {
            return data;
        }, function () {
            return null;
        }).catch(function () {
            return null;
        });
    }
    if (t === 'bson') {
        return (0, _fetchHelpers.fetchBSON)(spec).then(function (data) {
            return data;
        }, function () {
            return null;
        }).catch(function () {
            return null;
        });
    }
    if (t === 'cson') {
        return (0, _fetchHelpers.fetchCSON)(spec).then(function (data) {
            return data;
        }, function () {
            return null;
        }).catch(function () {
            return null;
        });
    }
    return _promise2.default.reject('not a supported type');
};

var loadSpecs = exports.loadSpecs = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(urls) {
        var specs;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        specs = [];
                        _context2.next = 3;
                        return _promise2.default.all(urls.map(function () {
                            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(url) {
                                var spec;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.next = 2;
                                                return (0, _fetchHelpers.fetchJSON)(url);

                                            case 2:
                                                spec = _context.sent;

                                                specs.push(spec);

                                            case 4:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, undefined);
                            }));

                            return function (_x2) {
                                return _ref2.apply(this, arguments);
                            };
                        }()));

                    case 3:
                        return _context2.abrupt('return', specs);

                    case 4:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function loadSpecs(_x) {
        return _ref.apply(this, arguments);
    };
}();