'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _vegaTooltip = require('vega-tooltip');

var addTooltips = function addTooltips(data) {
    data.forEach(function (d) {
        if (d.vmvConfig !== null && typeof d.vmvConfig.tooltipOptions !== 'undefined') {
            (0, _vegaTooltip.vega)(d.view, d.vmvConfig.tooltipOptions);
        }
    });
};

exports.default = addTooltips;