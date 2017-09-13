'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addElements = function addElements(data, container, className) {
    return _ramda2.default.map(function (d) {
        if (d.view === null) {
            return (0, _extends3.default)({}, d, {
                element: null
            });
        }
        var element = d.vmvConfig.element;
        if (element === false) {
            // headless rendering
            element = null;
        } else if (_ramda2.default.isNil(element) === false) {
            if (typeof element === 'string') {
                element = document.getElementById(d.vmvConfig.element);
                if (_ramda2.default.isNil(element)) {
                    // console.error(`element "${d.vmvConfig.element}" could not be found`);
                    element = document.createElement('div');
                    element.id = d.vmvConfig.element;
                    container.appendChild(element);
                }
            } else if (element instanceof HTMLElement !== true) {
                console.error('element "' + d.vmvConfig.element + '" is not a valid HTMLElement');
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
            if (d.vmvConfig.leaflet === true) {
                element.style.width = d.spec.width + 'px';
                element.style.height = d.spec.height + 'px';
            }
            container.appendChild(element);
        }

        return (0, _extends3.default)({}, d, {
            element: element,
            parent: container
        });
    }, data);
};

exports.default = addElements;