'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addElements = function addElements(data, container) {
    return _ramda2.default.map(function (d) {
        if (d.view === null) {
            return (0, _extends3.default)({}, d, {
                element: null
            });
        }
        var element = d.vmvConfig.element;

        // default is headless rendering

        var divElement = null;
        if (typeof element === 'string') {
            divElement = document.getElementById(element);
            if (divElement === null) {
                // console.error(`element "${element}" could not be found`);
                divElement = document.createElement('div');
                divElement.id = element;
                container.appendChild(divElement);
            }
        } else if (element instanceof HTMLElement) {
            if (document.getElementById(element.id) === null) {
                container.appendChild(element);
            }
            divElement = element;
        } else if (typeof element !== 'undefined') {
            console.error('element "' + element + '" is not an id or a valid HTMLElement');
            return (0, _extends3.default)({}, d, {
                element: null
            });
        } else {
            divElement = document.createElement('div');
            divElement.id = d.id;
            container.appendChild(divElement);
        }

        return (0, _extends3.default)({}, d, {
            element: divElement
            // parent: container,
        });
    }, data);
};

exports.default = addElements;