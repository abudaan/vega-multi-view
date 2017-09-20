'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var head = document.getElementsByTagName('head').item(0);

var index = 0;
var addStyling = function addStyling(id, styling, divElement) {
    var globalStyling = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    var _styling$url = styling.url,
        url = _styling$url === undefined ? null : _styling$url,
        _styling$css = styling.css,
        css = _styling$css === undefined ? null : _styling$css,
        _styling$cssAppend = styling.cssAppend,
        cssAppend = _styling$cssAppend === undefined ? true : _styling$cssAppend,
        _styling$addToHead = styling.addToHead,
        addToHead = _styling$addToHead === undefined ? false : _styling$addToHead,
        _styling$classes = styling.classes,
        classes = _styling$classes === undefined ? null : _styling$classes,
        _styling$classesAppen = styling.classesAppend,
        classesAppend = _styling$classesAppen === undefined ? true : _styling$classesAppen;


    var viewClasses = [];
    var globalClasses = [];
    if (typeof classes === 'string') {
        viewClasses = [classes];
    } else if (Array.isArray(classes)) {
        viewClasses = classes;
    }
    if (typeof globalStyling.classes === 'string') {
        globalClasses = [globalStyling.classes];
    } else if (Array.isArray(globalStyling.classes)) {
        globalClasses = globalStyling.classes;
    }

    if (classesAppend === true) {
        divElement.className = [].concat((0, _toConsumableArray3.default)(globalClasses), (0, _toConsumableArray3.default)(viewClasses)).join(' ');
    } else if (viewClasses.length > 0) {
        divElement.className = viewClasses.join(' ');
    } else if (globalClasses.length > 0) {
        divElement.className = globalClasses.join(' ');
    } else {
        divElement.className = '';
    }

    if (addToHead === true) {
        if (typeof css === 'string') {
            var style = document.getElementById('style-' + id);
            if (style === null) {
                style = document.createElement('style');
                style.id = 'style-' + id;
                style.type = 'text/css';
                head.appendChild(style);
            }
            var text = document.createTextNode(css);
            if (cssAppend === false) {
                style.innerHTML = '';
            }
            style.appendChild(text);
        } else if (typeof url === 'string') {
            var links = document.querySelectorAll('id^=' + id);
            if (cssAppend === false) {
                links.forEach(function (link) {
                    head.removeChild(link);
                });
            }
            var link = document.createElement('link');
            link.id = 'id-' + index;
            link.type = 'text/css';
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);
            head.appendChild(link);
            index += 1;
        }
    }
};

exports.default = addStyling;