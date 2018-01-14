'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.removeDataset = exports.replaceDataset = exports.remove = exports.insert = exports.change = undefined;

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _vega = require('vega');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var change = function change(view, publish, signal) {
    /*
        example publish:
         dataset:
            name: table
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

    if (Array.isArray(signal)) {
        var dataset = publish.dataset;

        var cs = (0, _vega.changeset)();
        signal.forEach(function (tuple) {
            var i = 0;
            _ramda2.default.tail(tuple).forEach(function (value) {
                var field = dataset.update.fields[i];
                i += 1;
                if (value !== null) {
                    if (dataset.select.test === '==') {
                        cs.modify(function (d) {
                            return d[dataset.select.field] === tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '!=') {
                        cs.modify(function (d) {
                            return d[dataset.select.field] !== tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '<') {
                        cs.modify(function (d) {
                            return d[dataset.select.field] < tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '>') {
                        cs.modify(function (d) {
                            return d[dataset.select.field] > tuple[0];
                        }, field, value);
                    }
                }
            });
        });
        view.change(publish.dataset.name, cs).run();
    }
};

var remove = function remove(view, publish, signal) {
    if (Array.isArray(signal)) {
        var dataset = publish.dataset;

        var cs = (0, _vega.changeset)();
        signal.forEach(function (tuple) {
            var i = 0;
            _ramda2.default.tail(tuple).forEach(function (value) {
                var field = dataset.update.fields[i];
                i += 1;
                if (value !== null) {
                    if (dataset.select.test === '==') {
                        cs.remove(function (d) {
                            return d[dataset.select.field] === tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '!=') {
                        cs.remove(function (d) {
                            return d[dataset.select.field] !== tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '<') {
                        cs.remove(function (d) {
                            return d[dataset.select.field] < tuple[0];
                        }, field, value);
                    } else if (dataset.select.test === '>') {
                        cs.remove(function (d) {
                            return d[dataset.select.field] > tuple[0];
                        }, field, value);
                    }
                }
            });
        });
        view.change(publish.dataset.name, cs).run();
    }
};

var insert = function insert(view, publish, signal) {
    if (Array.isArray(signal)) {
        var dataset = publish.dataset;

        var cs = (0, _vega.changeset)();
        signal.forEach(function (tuple) {
            cs.insert(dataset.name, tuple);
        });
        view.change(publish.dataset.name, cs).run();
    }
};

var replaceDataset = function replaceDataset(view, publish, signal) {
    var dataset = publish.dataset;

    view.remove(dataset.name, function () {
        return true;
    }).run();
    view.insert(dataset.name, signal).run();
};

var removeDataset = function removeDataset(view, publish) {
    var dataset = publish.dataset;

    view.remove(dataset.name, function () {
        return true;
    }).run();
    view.insert(dataset.name, {}).run();
};

exports.change = change;
exports.insert = insert;
exports.remove = remove;
exports.replaceDataset = replaceDataset;
exports.removeDataset = removeDataset;