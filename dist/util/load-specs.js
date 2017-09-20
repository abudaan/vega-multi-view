'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.loadSpecs = exports.loadSpec = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _fetchHelpers = require('fetch-helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var loadSpec = exports.loadSpec = function loadSpec(spec, type) {
    return (0, _fetchHelpers.load)(spec, type);
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