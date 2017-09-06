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

var mapIndexed = _ramda2.default.addIndex(_ramda2.default.map);

(0, _leafletVega2.default)();

var createLeafletVega = async function createLeafletVega(data, renderer) {
    var spec = data.spec,
        view = data.view,
        runtime = data.runtime,
        element = data.element;

    var signals = spec.signals || [];
    var zoom = _ramda2.default.find(_ramda2.default.propEq('name', 'zoom'))(signals);
    var latitude = _ramda2.default.find(_ramda2.default.propEq('name', 'latitude'))(signals);
    var longitude = _ramda2.default.find(_ramda2.default.propEq('name', 'longitude'))(signals);

    if (_ramda2.default.isNil(zoom) || _ramda2.default.isNil(latitude) || _ramda2.default.isNil(longitude)) {
        console.error('incomplete map spec');
        return;
    }

    var map = _leaflet2.default.map(element, {
        zoomAnimation: false
    }).setView([latitude.value, longitude.value], zoom.value);

    _leaflet2.default.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    _leaflet2.default.vega(view, {
        renderer: runtime.renderer || renderer,
        // Make sure the legend stays in place
        delayRepaint: true
    }).addTo(map);
};

var addDebug = function addDebug(datas) {
    _ramda2.default.forEach(function (d) {
        var spec = d.spec,
            view = d.view;


        _ramda2.default.forEach(function (signal) {
            view.addSignalListener(signal.name, function (signalName, signalData) {
                console.log('[SIGNAL] %s %s %O', spec.description || ' - ', signalName, signalData);
            });
        }, spec.signals || []);
    }, datas);

    var promises = _ramda2.default.map(function (d) {
        return new Promise(function (resolve) {
            var spec = d.spec,
                view = d.view;

            var numDataSources = spec.data.length;
            var numLoaded = 0;
            if (_ramda2.default.isNil(spec.data)) {
                resolve();
            }
            var dataPoller = setInterval(function () {
                _ramda2.default.forEach(function (data) {
                    var loaded = view.data(data.name);
                    if (loaded !== null) {
                        console.log('[DATA] %s %s %O', spec.description || ' - ', data.name, loaded);
                        numLoaded += 1;
                    }
                    if (numLoaded === numDataSources) {
                        // console.log('all data loaded');
                        clearInterval(dataPoller);
                        resolve();
                    }
                }, spec.data);
            }, 10);
        });
    }, datas);

    return Promise.all(promises);
};

var loadSpec = function loadSpec(spec) {
    if (typeof spec !== 'string') {
        return spec;
    }
    return (0, _fetchHelpers.fetchJSON)(spec);
};

var loadSpecs = async function loadSpecs(urls) {
    var specs = [];
    await Promise.all(urls.map(async function (url) {
        var spec = await (0, _fetchHelpers.fetchJSON)(url);
        specs.push(spec);
    }));
    return specs;
};

var publishSignal = function publishSignal(data) {
    var runtime = data.runtime,
        view = data.view;

    var streams = {};

    if (_ramda2.default.isNil(runtime.publish)) {
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
    }, runtime.publish);

    return streams;
};

var subscribeToSignal = function subscribeToSignal(data, streams) {
    var view = data.view,
        spec = data.spec,
        runtime = data.runtime;


    if (_ramda2.default.isNil(runtime.subscribe)) {
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
    }, runtime.subscribe);
};

var addViews = function addViews(data, renderer) {
    data.forEach(function (d, i) {
        var view = d.view,
            runtime = d.runtime,
            element = d.element;

        if (runtime.leaflet === true) {
            createLeafletVega(d, renderer);
        } else {
            view.renderer(runtime.renderer || renderer).initialize(element);
        }
    });
};

var addTooltips = function addTooltips(data) {
    data.forEach(function (d) {
        if (typeof d.runtime.tooltipOptions !== 'undefined') {
            (0, _vegaTooltip.vega)(d.view, d.runtime.tooltipOptions);
        }
    });
};

var connectSignals = function connectSignals(data) {
    var streams = {};
    _ramda2.default.forEach(function (d) {
        streams = _extends({}, streams, publishSignal(d));
    }, _ramda2.default.values(data));

    _ramda2.default.forEach(function (d) {
        subscribeToSignal(d, streams);
    }, _ramda2.default.values(data));
};

var addElements = function addElements(data, container, className) {
    return _ramda2.default.map(function (d) {
        var element = d.runtime.element;
        if (element === false) {
            // headless rendering
            element = null;
        } else if (_ramda2.default.isNil(element) === false) {
            if (typeof element === 'string') {
                element = document.getElementById(d.runtime.element);
                if (_ramda2.default.isNil(element)) {
                    console.error('element "' + d.runtime.element + '" could not be found');
                    return _extends({}, d, {
                        element: null
                    });
                }
            } else if (element instanceof HTMLElement !== true) {
                console.error('element "' + d.runtime.element + '" is not a valid HTMLElement');
                return _extends({}, d, {
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
        }
        if (element !== null) {
            element.style.width = d.spec.width + 'px';
            element.style.height = d.spec.height + 'px';
            container.appendChild(element);
        }
        return _extends({}, d, {
            element: element
        });
    }, data);
};

var createSpecData = function createSpecData(specs, runtimes) {
    var promises = mapIndexed(async function (s, i) {
        var spec = await loadSpec(s);
        var id = 'spec_' + i;
        var runtime = {};
        var specClone = _extends({}, spec);
        if (typeof specClone.runtime !== 'undefined') {
            runtime = _extends({}, specClone.runtime);
            delete specClone.runtime;
        } else if (_ramda2.default.isNil(runtimes[i]) === false) {
            runtime = runtimes[i];
        }
        var view = new _vega.View((0, _vega.parse)(specClone));
        return new Promise(function (resolve) {
            resolve({
                id: id,
                spec: specClone,
                view: view,
                runtime: runtime
            });
        });
    }, specs);
    return Promise.all(promises);
};

var createViews = async function createViews(config) {
    var _config$container = config.container,
        container = _config$container === undefined ? document.body : _config$container,
        specs = config.specs;
    var _config$className = config.className,
        className = _config$className === undefined ? false : _config$className,
        runtimes = config.runtimes,
        _config$renderer = config.renderer,
        renderer = _config$renderer === undefined ? 'canvas' : _config$renderer,
        _config$debug = config.debug,
        debug = _config$debug === undefined ? true : _config$debug;


    if (_ramda2.default.isNil(container)) {
        container = document.body;
    }

    if (_ramda2.default.isArrayLike(specs) === false) {
        specs = [specs];
    }

    var data = await createSpecData(specs, runtimes);
    data = addElements(data, container, className);
    addTooltips(data);
    connectSignals(data);
    if (debug) {
        await addDebug(data);
    }

    return new Promise(function (resolve) {
        // wait until the next paint cycle so the created elements
        // are added to the DOM, add the viewsm, then resolve
        setTimeout(function () {
            addViews(data, renderer);
            resolve({
                data: data
            });
        }, 0);
    });
};

exports.default = createViews;