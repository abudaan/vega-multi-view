var _this = this;

import R from 'ramda';
import L from 'leaflet';
import { parse, View } from 'vega';
import { vega as vegaTooltip } from 'vega-tooltip';
import { fetchJSON } from './util/fetch-helpers';
import initLeafletVega from './util/leaflet-vega';

var Rx = require('rxjs/Rx');

initLeafletVega();

var createLeafletVega = function () {
    var _ref = babelHelpers.asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(elem, spec, view) {
        var signals, zoom, latitude, longitude, map;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        signals = spec.signals || [];
                        zoom = R.find(R.propEq('name', 'zoom'))(signals);
                        latitude = R.find(R.propEq('name', 'latitude'))(signals);
                        longitude = R.find(R.propEq('name', 'longitude'))(signals);

                        if (!(R.isNil(zoom) || R.isNil(latitude) || R.isNil(longitude))) {
                            _context.next = 7;
                            break;
                        }

                        console.error('incomplete map spec');
                        return _context.abrupt('return');

                    case 7:
                        map = L.map(elem, {
                            zoomAnimation: false
                        }).setView([latitude.value, longitude.value], zoom.value);


                        L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
                            attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                            maxZoom: 18
                        }).addTo(map);

                        L.vega(view, {
                            renderer: spec.runtime.renderer || 'canvas',
                            // Make sure the legend stays in place
                            delayRepaint: true
                        }).addTo(map);

                    case 10:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, _this);
    }));

    return function createLeafletVega(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    };
}();

// const loadSpecs = async (urls: string[]) => {
var loadSpecs = function () {
    var _ref2 = babelHelpers.asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(urls) {
        var i, specs;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        i = 0;
                        specs = {};
                        _context3.next = 4;
                        return Promise.all(urls.map(function () {
                            var _ref3 = babelHelpers.asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(url) {
                                var spec, id, view, debug, numDataSources, numLoaded, dataPoller;
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _context2.next = 2;
                                                return fetchJSON(url);

                                            case 2:
                                                spec = _context2.sent;
                                                id = 'spec_' + i;
                                                view = new View(parse(spec));

                                                if (spec.runtime && spec.runtime.tooltipOptions) {
                                                    vegaTooltip(view, spec.runtime.tooltipOptions);
                                                }

                                                debug = false;

                                                if (debug) {
                                                    R.forEach(function (signal) {
                                                        view.addSignalListener(signal.name, function (name, data) {
                                                            console.log(spec.description, name, data);
                                                        });
                                                    }, spec.signals || []);

                                                    numDataSources = spec.data.length;
                                                    numLoaded = 0;
                                                    dataPoller = setInterval(function () {
                                                        R.forEach(function (data) {
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

                                            case 10:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this);
                            }));

                            return function (_x5) {
                                return _ref3.apply(this, arguments);
                            };
                        }()));

                    case 4:
                        return _context3.abrupt('return', specs);

                    case 5:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, _this);
    }));

    return function loadSpecs(_x4) {
        return _ref2.apply(this, arguments);
    };
}();

var createStream = function createStream(data) {
    var spec = data.spec,
        view = data.view;


    var streams = {};

    if (R.isNil(spec.runtime) || R.isNil(spec.runtime.publish)) {
        return streams;
    }

    R.forEach(function (publish) {
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


    if (R.isNil(spec.runtime) || R.isNil(spec.runtime.subscribe)) {
        return;
    }

    R.forEach(function (subscribe) {
        var s = streams[subscribe.signal];
        if (R.isNil(s)) {
            console.error('no stream for signal "' + subscribe.signal + '"');
            return;
        }
        if (R.isNil(R.find(R.propEq('name', subscribe.as))(spec.signals))) {
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
            R.forEach(function (spec) {
                streams = babelHelpers.extends({}, streams, createStream(spec));
            }, R.values(specs));

            R.forEach(function (spec) {
                subscribeToStream(spec, streams);
            }, R.values(specs));

            var specsArray = R.map(function (id) {
                return specs[id];
            }, R.keys(specs));
            var divs = addDivs(specsArray, container, cssClass);
            setTimeout(function () {
                addViews(specsArray, divs);
                resolve('done');
            }, 0);
        });
    });
};

export default createViews;