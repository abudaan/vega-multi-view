'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removeDataset = exports.replaceDataset = exports.remove = exports.insert = exports.change = undefined;

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _extends3 = require('babel-runtime/helpers/extends');

var _extends4 = _interopRequireDefault(_extends3);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _vega = require('vega');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var change = function change(view, query, signal) {
    /*
        example query:
         query:
            dataset: table
            action: change
            select:
                field: category
                test: ==
            update:
                fields:
                    - amount
                    - color
          example signal:
         dataset: table
        action: change
        values:
            -   select:
                    test: ==
                    field: category
                    value: selectedCategory.category
                update:
                    field: amount
                    value: changeAmount.amount
            -   select:
                    test: '=='
                    field: 'category'
                    value: 'A'
            -   update:
                    field: 'amount'
                    value: changeAmount.amount * 0.2
            -   select:
                    test: '=='
                    field: 'category'
                    value: 'A'
            -   update:
                    field: 'color'
                    value: red
    */

    if (typeof signal !== 'undefined' && Array.isArray(signal)) {
        var dataset = query.dataset,
            select = query.select,
            update = query.update;

        var cs = (0, _vega.changeset)();
        signal.forEach(function (tuple) {
            var i = 0;
            _ramda2.default.tail(tuple).forEach(function (value) {
                var field = update.fields[i];
                i += 1;
                if (value !== null) {
                    if (select.test === '==') {
                        cs.modify(function (d) {
                            return d[select.field] === tuple[0];
                        }, field, value);
                    } else if (select.test === '!=') {
                        cs.modify(function (d) {
                            return d[select.field] !== tuple[0];
                        }, field, value);
                    } else if (select.test === '<') {
                        cs.modify(function (d) {
                            return d[select.field] < tuple[0];
                        }, field, value);
                    } else if (select.test === '>') {
                        cs.modify(function (d) {
                            return d[select.field] > tuple[0];
                        }, field, value);
                    }
                }
            });
        });
        view.change(dataset, cs).run();
    }
};

var remove = function remove(view, query, signal) {
    if (typeof signal !== 'undefined' && Array.isArray(signal)) {
        var dataset = query.dataset,
            select = query.select;

        var cs = (0, _vega.changeset)();
        // console.log('remove', signal);
        signal.forEach(function (tuple) {
            if (select.test === '==') {
                cs.remove(function (d) {
                    return d[select.field] === tuple[0];
                });
            } else if (select.test === '!=') {
                cs.remove(function (d) {
                    return d[select.field] !== tuple[0];
                });
            } else if (select.test === '<') {
                cs.remove(function (d) {
                    return d[select.field] < tuple[0];
                });
            } else if (select.test === '>') {
                cs.remove(function (d) {
                    return d[select.field] > tuple[0];
                });
            }
        });
        view.change(dataset, cs).run();
    }
};

var insert = function insert(view, query, signal) {
    if (typeof signal !== 'undefined' && Array.isArray(signal)) {
        var dataset = query.dataset;
        // console.log('insert', dataset, signal);

        view.insert(dataset, signal).run();
    }
};

var replaceDataset = function replaceDataset(view, query, signal) {
    // console.log('replace_all', signal, typeof signal === 'undefined');
    if (typeof signal !== 'undefined' && typeof signal.data !== 'undefined') {
        var dataset = query.dataset;
        // deep clone, remove Symbol key vega_id

        var clones = _ramda2.default.map(function (value) {
            return _ramda2.default.reduce(function (acc, val) {
                return (0, _extends4.default)({}, acc, (0, _defineProperty3.default)({}, val, value[val]));
            }, {}, _ramda2.default.keys(value));
        }, signal.data);
        view.remove(dataset, function () {
            return true;
        }).run();
        view.insert(dataset, clones).run();
    }
    // if (typeof signal !== 'undefined' && Array.isArray(signal)) {
    //     const { dataset } = query;
    //     view.remove(dataset, () => true).run();
    //     view.insert(dataset, signal).run();
    // }
};

var removeDataset = function removeDataset(view, query, signal) {
    // console.log('remove_all', signal, typeof signal === 'undefined');
    if (signal === true) {
        var dataset = query.dataset;

        view.remove(dataset, function () {
            return true;
        }).run();
    }
};

exports.change = change;
exports.insert = insert;
exports.remove = remove;
exports.replaceDataset = replaceDataset;
exports.removeDataset = removeDataset;