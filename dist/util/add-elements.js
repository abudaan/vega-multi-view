'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _vega = require('vega');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var addElements = function addElements(data, container) {
    return _ramda2.default.map(function (d) {
        console.log(d);
        if (d.vmvConfig === null) {
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
        // /*
        // For Chrome browsers:
        // if no width or height has been set in the spec, the missing value(s) will be set to the
        // containing element's width and / or height
        if (_ramda2.default.isNil(d.spec.width) || _ramda2.default.isNil(d.spec.height) || d.spec.width === 0 || d.spec.height === 0) {
            var bounds = divElement.getBoundingClientRect();
            var width = d.spec.width || bounds.width;
            var height = d.spec.height || bounds.height;
            // check if the padding is set as an object or as a numeric value for all each padding side
            var pad = typeof d.spec.padding === 'number' ? d.spec.padding : 0;

            var _ref = d.spec.padding || {},
                _ref$left = _ref.left,
                paddingLeft = _ref$left === undefined ? pad : _ref$left,
                _ref$right = _ref.right,
                paddingRight = _ref$right === undefined ? pad : _ref$right,
                _ref$top = _ref.top,
                paddingTop = _ref$top === undefined ? pad : _ref$top,
                _ref$bottom = _ref.bottom,
                paddingBottom = _ref$bottom === undefined ? pad : _ref$bottom;
            // put the width and the height in the spec; otherwise the view won't be visible
            // the first time the spec is rendered to the page


            d.spec.width = width - paddingLeft - paddingRight;
            d.spec.height = height - paddingTop - paddingBottom;
        }
        // */
        var view = new _vega.View((0, _vega.parse)(d.spec));
        return (0, _extends3.default)({}, d, {
            view: view,
            element: divElement
        });
    }, data);
};

exports.default = addElements;