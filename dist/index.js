'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _vega = require('vega');

var _vegaTooltip = require('vega-tooltip');

var _fetchHelpers = require('./util/fetch-helpers');

var _leafletVega = require('./util/leaflet-vega');

var _leafletVega2 = _interopRequireDefault(_leafletVega);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Rx = require('rxjs/Rx');

(0, _leafletVega2.default)();

var createLeafletVega = async function createLeafletVega(elem, spec, view) {
    var signals = spec.signals || [];
    var zoom = _ramda2.default.find(_ramda2.default.propEq('name', 'zoom'))(signals);
    var latitude = _ramda2.default.find(_ramda2.default.propEq('name', 'latitude'))(signals);
    var longitude = _ramda2.default.find(_ramda2.default.propEq('name', 'longitude'))(signals);

    if (_ramda2.default.isNil(zoom) || _ramda2.default.isNil(latitude) || _ramda2.default.isNil(longitude)) {
        console.error('incomplete map spec');
        return;
    }

    var map = _leaflet2.default.map(elem, {
        zoomAnimation: false
    }).setView([latitude.value, longitude.value], zoom.value);

    _leaflet2.default.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    _leaflet2.default.vega(view, {
        renderer: spec.runtime.renderer || 'canvas',
        // Make sure the legend stays in place
        delayRepaint: true
    }).addTo(map);
};

// const loadSpecs = async (urls: string[]) => {
var loadSpecs = async function loadSpecs(urls) {
    var i = 0;
    var specs = {};
    await Promise.all(urls.map(async function (url) {
        var spec = await (0, _fetchHelpers.fetchJSON)(url);
        var id = 'spec_' + i;
        var view = new _vega.View((0, _vega.parse)(spec));
        if (spec.runtime && spec.runtime.tooltipOptions) {
            (0, _vegaTooltip.vega)(view, spec.runtime.tooltipOptions);
        }

        var debug = false;
        if (debug) {
            _ramda2.default.forEach(function (signal) {
                view.addSignalListener(signal.name, function (name, data) {
                    console.log(spec.description, name, data);
                });
            }, spec.signals || []);

            var numDataSources = spec.data.length;
            var numLoaded = 0;
            var dataPoller = setInterval(function () {
                _ramda2.default.forEach(function (data) {
                    var loaded = view.data(data.name);
                    if (loaded !== null) {
                        console.log('[DATA]:', spec.description, data.name, loaded);
                        numLoaded += 1;
                    }
                    if (numLoaded === numDataSources) {
                        // console.log('all data loaded');
                        clearInterval(dataPoller);
                    }
                }, spec.data || []);
            }, 10);
        }

        specs[id] = {
            id: id,
            spec: spec,
            view: view
        };
        i += 1;
    }));
    return specs;
};

var createStream = function createStream(data) {
    var spec = data.spec,
        view = data.view;


    var streams = {};

    if (_ramda2.default.isNil(spec.runtime) || _ramda2.default.isNil(spec.runtime.publish)) {
        return streams;
    }

    _ramda2.default.forEach(function (publish) {
        try {
            var s = new Rx.Subject();
            view.addSignalListener(publish.signal, function (name, value) {
                s.next(value);
            });
            streams[publish.as] = s;
        } catch (e) {
            console.error(e.message);
        }
    }, spec.runtime.publish);

    return streams;
};

var subscribeToStream = function subscribeToStream(data, streams) {
    var spec = data.spec,
        view = data.view;


    if (_ramda2.default.isNil(spec.runtime) || _ramda2.default.isNil(spec.runtime.subscribe)) {
        return;
    }

    _ramda2.default.forEach(function (subscribe) {
        var s = streams[subscribe.signal];
        if (_ramda2.default.isNil(s)) {
            console.error('no stream for signal "' + subscribe.signal + '"');
            return;
        }
        if (_ramda2.default.isNil(_ramda2.default.find(_ramda2.default.propEq('name', subscribe.as))(spec.signals))) {
            console.error('no signal "' + subscribe.as + '" found in spec');
            return;
        }
        s.subscribe(function (value) {
            // console.log(subscribe.as, value);
            view.signal(subscribe.as, value).run();
        });
    }, spec.runtime.subscribe);
};

var addViews = function addViews(specs, divs) {
    specs.forEach(function (d, i) {
        var id = d.id,
            spec = d.spec,
            view = d.view;

        var div = divs[i];
        if (spec.runtime.leaflet === true) {
            createLeafletVega(div, spec, view);
        } else {
            view.renderer(spec.runtime.renderer || 'canvas').initialize('#' + id);
        }
    });
};

var addDivs = function addDivs(specs, container, cssClass) {
    var divs = [];
    specs.forEach(function (d) {
        var elem = document.createElement('div');
        var id = d.id,
            spec = d.spec;

        elem.id = id;
        elem.className = cssClass;
        elem.style.width = spec.width + 'px';
        elem.style.height = spec.height + 'px';
        container.appendChild(elem);
        divs.push(elem);
    });
    return divs;
};

var createViews = function createViews(data) {
    var container = data.container,
        cssClass = data.cssClass,
        urls = data.urls;


    return new Promise(function (resolve, reject) {
        loadSpecs(urls).then(function (specs) {
            var streams = {};
            _ramda2.default.forEach(function (spec) {
                streams = _extends({}, streams, createStream(spec));
            }, _ramda2.default.values(specs));

            _ramda2.default.forEach(function (spec) {
                subscribeToStream(spec, streams);
            }, _ramda2.default.values(specs));

            var specsArray = _ramda2.default.map(function (id) {
                return specs[id];
            }, _ramda2.default.keys(specs));
            var divs = addDivs(specsArray, container, cssClass);
            setTimeout(function () {
                addViews(specsArray, divs);
                resolve('done');
            }, 0);
        });
    });
};

exports.default = createViews;