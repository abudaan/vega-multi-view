# Vega multi view

This library is a wrapper of the Vega runtime API that allows you to add multiple Vega views to a HTML page that can listen to each others signals, despite the fact that each view lives in a separate HTML element.

It includes [vega-tooltip](https://github.com/vega/vega-tooltip) and [vega-as-leaflet-layer](https://github.com/abudaan/vega-as-leaflet-layer) which is based on [leaflet-vega](https://github.com/nyurik/leaflet-vega).


## Table of Contents

* [Vega multi view](#vega-multi-view)
    * [Table of Contents](#table-of-contents)
    * [How to use](#how-to-use)
    * [Terminology](#terminology)
        * [Types](#types)
    * [API](#api)
        * [addViews(config: ConfigType): Promise&lt;any&gt;](#addviewsconfig-configtype-promiseany)
        * [removeViews(string | Array&lt;string&gt;): ResultType](#removeviewsstring--arraystring-resulttype)
        * [showSpecInTab(SpecType)](#showspecintabspectype)
    * [Configuration](#configuration)
        * [Global configuration (ConfigType)](#global-configuration-configtype)
        * [debug: boolean](#debug-boolean)
        * [overwrite: boolean](#overwrite-boolean)
        * [element: string | HTMLElement](#element-string--htmlelement)
        * [renderer: "canvas" | "svg"](#renderer-canvas--svg)
        * [run: boolean](#run-boolean)
        * [hover: boolean](#hover-boolean)
        * [specs: { [string]: SpecType }](#specs--string-spectype-)
        * [styling: StylingType](#styling-stylingtype)
            * [url: string](#url-string)
            * [css: string](#css-string)
            * [addToHead: boolean](#addtohead-boolean)
            * [cssAppend: boolean](#cssappend-boolean)
            * [classes: string | Array&lt;string&gt;](#classes-string--arraystring)
            * [classesAppend: boolean](#classesappend-boolean)
        * [dataPath: string](#datapath-string)
        * [imagePath: string](#imagepath-string)
        * [View specific configuration (ViewConfigType)](#view-specific-configuration-viewconfigtype)
        * [spec: string](#spec-string)
        * [renderer: "canvas" | "svg"](#renderer-canvas--svg-1)
        * [element: false | string | HTMLElement](#element-false--string--htmlelement)
        * [run: boolean](#run-boolean-1)
        * [hover: boolean](#hover-boolean-1)
        * [leaflet: boolean](#leaflet-boolean)
        * [publish: SignalType | Array&lt;SignalType&gt;](#publish-signaltype--arraysignaltype)
        * [subscribe: SignalType | Array&lt;SignalType&gt;](#subscribe-signaltype--arraysignaltype)
        * [tooltipOptions: TooltipType](#tooltipoptions-tooltiptype)
        * [styling: StylingType](#styling-stylingtype-1)
            * [url: string](#url-string-1)
            * [css: string](#css-string-1)
            * [addToHead: boolean](#addtohead-boolean-1)
            * [classes: string | Array&lt;string&gt;](#classes-string--arraystring-1)
            * [classesAppend: boolean](#classesappend-boolean-1)
        * [Leaflet](#leaflet)
        * [Publish and subscribe signals](#publish-and-subscribe-signals)
        * [Tooltips](#tooltips)
    * [More examples](#more-examples)
        * [Example #1](#example-1)
        * [Example #2](#example-2)
        * [Example #3](#example-3)
        * [Example #4](#example-4)
        * [Example #5](#example-5)
    * [Add it to your own project](#add-it-to-your-own-project)
        * [Javascript](#javascript)
        * [Install for use as esnext or commonjs module](#install-for-use-as-esnext-or-commonjs-module)
        * [Esnext (recommended)](#esnext-recommended)
        * [Commonjs](#commonjs)
        * [Coding like it's 1999](#coding-like-its-1999)
        * [CSS](#css)
    * [See it in action](#see-it-in-action)

<sub>(toc created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc))</sub>

## How to use

Most Basic example:

```javascript
import { addViews } from 'vega-multi-view';

const config = {
    specs: {
        spec1: './specs/spec1.json',
        spec2: './specs/spec2.json',
    },
};

addViews(data)
    .then(result => console.log(result));
```

## Terminology

A `spec` is a Vega specification, it tells the [Vega runtime](https://github.com/vega/vega/wiki/Runtime) what to render on the page.

A `view` is the rendered instance of that spec on a HTML page.

The `vega-multi-view` wrapper applies settings to the Vega runtime *before* rendering, such as setting the renderer type (canvas or svg), and performs some extra steps *after* rendering, notably connecting the signals of the views.

The global configuration of `vega-multi-view` defines which specs will be added as views to your page, and you can set parameters that are applied to the pre- and post-processing of these views.

With a view specific configuration you can override some of the global settings and add extra parameters that for instance tell `vega-multi-view` which signals to publish or to subscribe to.

This view specific configuration can be added to a spec (inlined), for this you can use the key `vmvConfig` (see [example #1](#example-1) below). You can also provide a configuration separately. It is also possible to use no view specific configuration at all: then the view will be rendered with the global settings.

Both the global and the view specific configuration, as well as the Vega spec can be created from a:
* javascript object (POJO)
* JSON string
* uri of a JSON, BSON, CSON or YAML file.

### Types

Below the mapping of the terms above to their javascript types; these types are used in the upcoming API chapter:

- `spec`: `VegaSpecType`
- `view`: `VegaViewType`
- global configuration: `ConfigType`
- view specific configuration: `ViewConfigType`

For the type definition of `VegaSpecType` see [this part](https://vega.github.io/vega/docs/specification/) of the Vega 3 documentation.

For the type definition of `VegaViewType` see [this part](https://vega.github.io/vega/docs/api/view/) of the Vega 3 documentation.


## API

The `vega-multi-view` module exposes 3 methods:
* [addViews](#addviewsconfig-configtype-promiseany)
* [removeViews](#removeviewsstring--arraystring-resulttype)
* [showSpecInTab](#showspecintabspectype)

### `addViews(config: string | ConfigType): Promise<any>`

You can pass the uri of a global configuration file or the configuration as object. The types listed below will be explained in detail in [configuration chapter](#configuration).

```javascript
// @flow
type ConfigType = {
    debug?: boolean,
    overwrite?: boolean,
    element?: string | HTMLElement
    renderer?: "canvas" | "svg",
    run?: boolean,
    hover?: boolean,
    specs: {
        [string]: SpecType,
    },
    styling?: StylingType,
    dataPath?: string,
    imagePath?: string,
};

type SpecType =
    | string
    | VegaSpecType
    | [string, string]
    | [VegaSpecType, string]
    | [VegaSpecType, ViewConfigType]
;

type StylingType = {
    url?: string,
    css?: string,
    cssAppend?: boolean,
    addToHead?: boolean,
    classes?: string | Array<string>,
    classesAppend?: boolean,
};

type ViewConfigType = {
    spec?: string,
    element?: false | string | HTMLElement
    renderer?: "canvas" | "svg",
    run?: boolean,
    hover?: boolean,
    leaflet?: boolean,
    styling?: StylingType,
    publish?: SignalType | Array<SignalType>,
    subscribe?: SignalType | Array<SignalType>,
    tooltipOptions: TooltipType,
};

type SignalType = {
    [signal: string]: string,
    [as: string]: string,
};

type TooltipType = {
    [showAllFields: string]?: boolean,
    [fields: string]?: {
        [formatType: string]: string,
        [field: string]: string,
        [title: string]: string,
    },
};
```

After all views have been added to the page, the resolve function returns a key-value store object containing information about each view. Information per view:

```javascript
// @flow
type ResultType = {
    // The id as you have set it in the specs object (see below)
    id: string,

    // Reference to the HTML Element that contains the Vega view or
    // null in case of headless rendering.
    element: null | HTMLElement

    // The Vega specification as javascript object (see below)
    spec: VegaSpecType

    // The view specific configuration (see below)
    vmvConfig: ViewConfigType

    // Reference to the HTML element that contains the rendered Vega
    // view
    view: HTMLElement
};
```

### `removeViews(string | Array<string>): ResultType`

You can remove views by providing the ids of the views that you want to be removed.

```javascript
// single view
removeViews('spec1');

// list of views
removeViews('spec1', 'spec2', 'spec3');

// array of views
removeViews(['spec1', 'spec2', 'spec3']);
```

### `showSpecInTab(SpecType)`

You can also import a utility function that prints the spec in JSON format to a new tab:

```javascript
import { showSpecInTab } from 'vega-multi-view';
import spec from '../specs/my-spec';

button.addEventListener('click', () => {
    showSpecInTab(spec);
});
```

## Configuration

Let's have a look at what the configurations actually look like. Below I have chosen to use YAML because it provides a clear syntax but of course you can define your configuration in any supported format.

### Global configuration (ConfigType)

```yaml
---
debug: false
overwrite: false
element: id
renderer: canvas
run: true
hover: false
specs:
    spec1: ../specs/spec1.yaml,
    spec2: [../specs/spec2.vg.json, ../conf/spec2.yaml]
styling:
    url: ../css/view1.css
    css: 'div {color: red}'
    cssAppend: true,
    addToHead: false,
    class: [view, square],
    classAppend: true
dataPath: ./assets/data
imagePath: ./assets/img
```

Note that only the `specs` entry is mandatory. That is, you can leave it out but then nothing will be rendered.

#### `debug: boolean`
Print signal and data updates to the browser console. Defaults to false.

#### `overwrite: boolean`
Whether or not an existing spec in the store will be overwritten by a spec with the same id that is added afterwards.

#### `element: string | HTMLElement`

The element where all Vega views will be rendered to. Inside this element every view creates its own containing HTML element. If the element does not exist a div will be created and added to the body of the document. You can either specify an id (string) or a HTML element. Defaults to document.body.

#### `renderer: "canvas" | "svg"`

The renderer that will used for all views, unless overridden by a view specific configuration.

#### `run: boolean`

Whether or not to call the `run()` method of a view after it has been added to the DOM. Defaults to true and will be overridden by a view specific configuration.

#### `hover: boolean`

Whether or not to call the `hover()` method of the view after it has been added to the page. Defaults to false and will be overridden by a view specific configuration.

#### `specs: { [string]: SpecType }`

A key-value store object where the keys are the unique ids by which the Vega specs can be identified. The value is a single spec or a tuple, in case you set a tuple the second value is the view specific configuration file (see  below). Both the spec and the configuration can be any of the types listed  above.

#### `styling: StylingType`

Add styling that applies to all views and / or containing elements of the views. Can be overwritten by view specific configuration.

```javascript
// @flow
type StylingType = {
    url?: string,
    css?: string,
    cssAppend?: boolean,
    addToHead?: boolean,
    classes?: string | Array<string>,
    classesAppend?: boolean,
};
```

##### `url: string`

The url of an external stylesheet. Note that this setting only has effect when the renderer is set to 'svg'.

##### `css: string`

SVG renderer only. The css as string, allows you to inline the css in the configuration file which saves a HTTP request. If you set both `url` and `css`, the value set for `css` will prevail.

##### `addToHead: boolean`

SVG renderer only. Adds the styling to the head of the HTML page before the Vega view(s) get rendered, defaults to false. Default value is false, keep this setting if you want to bundle styles on the server before sending to the client. Note that this setting only has effect when the renderer is set to 'svg'.

##### `cssAppend: boolean`
SVG renderer only. Whether or not the new new styling rules will be be added to the existing rules or replace them. Defaults to true which means that new rules will be added to the existing.

##### `classes: string | Array<string>`

The css class or array of css classes that will be added to the view's containing HTML element, unless overridden by a view specific configuration.

##### `classesAppend: boolean`

Whether the classes should be appended to the existing classes or replace them. Defaults to true. This setting can be very handy if you call `addViews` repeatedly and you want to adjust the size of all views based on the number of views that are added to the page.


#### `dataPath: string`

Path to data sets that the Vega spec needs to load. The entries `dataPath` and `imagePath` are only useful if you generate or customize your Vega specs before rendering. For an example of how you can use `dataPath` and `imagePath` see the [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server).

#### `imagePath: string`
Path to the images that the Vega spec needs to load, for instance for rendering marks.


### View specific configuration (ViewConfigType)

```yaml
---
spec: spec_1
renderer: canvas
element: id
run: true
hover: false
leaflet: false
publish:
    - signal: internalSignalName1
      as: externalSignalName1
    - signal: internalSignalName2
      as: externalSignalName2
subscribe:
    signal: externalSignalNameOfAnotherView
    as: internalSignalName2
tooltipOptions:
    showAllFields: false
    fields:
        - formatType: string
          field: fieldName
          title: displayName
styling:
    url: ../css/view1.css
    css: 'div {color: red}'
    addToHead: false
    classes: [view, small-view]
    classesAppend: true
```

Note that because a spec can be rendered without a view specific configuration file, none of the parameters above are mandatory.

#### `spec: string`

The spec this configuration belongs to.

#### `renderer: "canvas" | "svg"`

The renderer to use this view

#### `element: false | string | HTMLElement`

The element where the view will be rendered to. If the element does not exist a div will be created and added to the HTML element that is set in the global settings. Use false (boolean) for headless rendering.

#### `run: boolean`

Whether or not to call the `run()` method of the view after it has been added to the page. Defaults to true.

#### `hover: boolean`

Whether or not to call the `hover()` method of the view after it has been added to the page. Defaults to false.

#### `leaflet: boolean`

Whether or not the Vega view should be added as a layer to a Leaflet map. Defaults to false.

#### `publish: SignalType | Array<SignalType>`

```javascript
// @flow
type SignalType = {
    [signal: string]: string,
    [as: string]: string,
};
```

A signal or array of signals that will be available for the other views to listen to.

#### `subscribe: SignalType | Array<SignalType>`

A signal or array of signals originating from another view that this view wants to listen to.

#### `tooltipOptions: TooltipType`

The options that will be passed on to vega-tooltip for rendering custom tooltips on top of the view.

```javascript
// @flow
type TooltipType = {
    [showAllFields: string]?: boolean,
    [fields: string]?: {
        [formatType: string]: string,
        [field: string]: string,
        [title: string]: string,
    },
};
```

#### `styling: StylingType`

Add view specific styling to the view. You can add the URI of an external css file or inline the styling as text. If you set values for both url and css, the value set for css will prevail. The setting addToHead defaults to false, if you set it totrue the styling will be added to the head of the page before the Vega view gets rendered. If you set it to false, you can bundle all styles on the server before sending to the client. Note that you can only style a view when you use the SVG renderer.

```javascript
// @flow
type StylingType = {
    url?: string,
    css?: string,
    cssAppend?: boolean,
    addToHead?: boolean,
    classes?: string | Array<string>,
    classesAppend?: boolean,
};
```

##### `url: string`

The url of an external stylesheet. Note that this setting only has effect when the renderer is set to 'svg'.

##### `css: string`

SVG renderer only. The css as string, allows you to inline the css in the configuration file which saves a HTTP request. If you set both `url` and `css`, the value set for `css` will prevail.

##### `cssAppend: boolean`
Not supported in `ViewConfigType`. You can pass a value but it will be ignored.

##### `addToHead: boolean`

SVG renderer only. Adds the styling to the head of the HTML page before the Vega view gets rendered, defaults to false. Default value is false, keep this setting if you want to bundle styles on the server before sending to the client. Note that this setting only has effect when the renderer is set to 'svg'.

##### `classes: string | Array<string>`

The css class or array of css classes that will be added to the view's containing HTML element.

##### `classesAppend: boolean`

Whether the classes should be appended to the existing classes or replace them. Defaults to true. This setting can be very handy if want to extend or overwrite some rules in the css class that is defined in the global configuration. For instance you want to use the global styling but overrule the background color.

### Leaflet

Vega does not support tile maps but by using [vega-as-leaflet-layer](https://github.com/abudaan/vega-as-leaflet-layer) we can render a Vega view to a layer in Leaflet. The Leaflet map itself will be added to the HTML element as specified in the configuration.

If you want to render your spec to a Leaflet layer your spec must have defined the signals `zoom` and `latitude` and `longitude`. If your spec does not specify one or all of the mandatory signals an error will be logged to the browser console and nothing will be rendered.

For more information about rendering Vega to a Leaflet layer see the [readme](https://github.com/abudaan/vega-as-leaflet-layer/blob/master/README.md) of `vega-as-leaflet-layer`.

You can read more about zoom, latitude and longitude in the Leaflet [documentation](http://leafletjs.com/examples/zoom-levels/)


### Publish and subscribe signals

This is the core functionality of `vega-multi-view` that makes internal signals of views available for each other despite the fact that they all live in a separate HTML element. Both publish and subscribe use aliases so as to avoid name clashes.

For instance if 2 specs both have a signal named `hover` you can publish them with an alias to keep them apart, you could use the aliases `hover_spec1` and `hover_spec2`. Now other views can pick the signal they are interested in.

A common scenario is when a mouse over event in one view should trigger the hover of another view as well or when one spec sets a range in the data that is rendered by another spec.

Note that you define publish and subscribe aliases in the configuration of a view. This means that when the view is added to a page it might be possible that the configuration of another spec has already defined aliases with the same name. Therefor I recommend to prefix or suffix the names of your aliases with the filename or the name of the spec.

### Tooltips

The `vega-multi-view` uses Vega-tooltip, for more information see the [documentation](https://github.com/vega/vega-tooltip)

## More examples

Let's look at some more examples:

### Example #1

```javascript
import { addViews } from 'vega-multi-view';
import spec1 from '../specs/vega-spec1';

spec1.vmvConfig = {
    leaflet: true,
    publish: [{
        signal: 'hover',
        as: 'spec1_hover',
    }],
    subscribe: [{
        signal: 'spec2_hover',
        as: 'hover',
    }],
};

const config = {
    specs: {
        spec1: spec1,
        spec2: ['../specs/spec2.yaml', {
            element: 'divSpec2',
            hover: true,
            publish: [{
                signal: 'hover',
                as: 'spec2_hover',
            }],
            subscribe: [{
                signal: 'spec1_hover',
                as: 'hover',
            }],
        }]
    }
};

addViews(data)
    .then(result => {
        const view1 = result.spec1.view;
        view1.hover();
    });

```
What we see here is two specs that respond to each other's hover signal.

The spec is imported as javascript object, then a configuration is added to the spec. You can safely add a `vmvConfig` entry to a spec because it will be stripped off before the spec is passed to the Vega parser. If you have to load a spec from the server it saves you a HTTP request if you inline the view specific configuration in the spec.

The second spec is added as a tuple; the first element is always the spec, the second the configuration. Remember that both spec and configuration can created from a:

* javascript object (POJO)
* JSON string
* uri of a JSON, BSON, CSON or YAML file.

Personally I find a Vega specs in YAML format the best readable. Also a YAML file is a bit smaller in file size compared to JSON.

In the resolve function of the `addViews` promise we have to enable hover event processing for spec1 because `hover` defaults to false and it hasn't been overridden in the view specific configuration. The configuration of spec2 has already overridden the global `hover` setting.

The [`vega-specs` project](https://github.com/abudaan/vega-specs) shows how you can create Vega specs in javascript and export them in several formats (JSON, BSON, CSON, YAML or as a template).

### Example #2

```javascript
import { addViews } from 'vega-multi-view';
import fetchYAML from 'fetch-helpers';

fetchYAML('../my-global-config.yaml', 'yaml')
    .then(data => addViews(data, 'yaml'))
    .then(result => {
        console.log(result)
    });

```
Here we see an example where the global configuration is loaded as a YAML file. We use a small library called `fetch-helpers` that can fetch files in JSON, BSON, CSON and YAML format and parses the content of the file to a javascript object.

Although both `fetch-helpers` and `vega-multi-view` detect the file-type automatically, you can optionally pass the type as argument which makes it a tiny bit faster.

Note that you can not provide a type for view specific configurations or for the vega specs; in those cases `vega-multi-view` will detect it for you and log a warning to the browser console if the type can not be inferred.

### Example #3

```javascript
import { addViews } from 'vega-multi-view';

addViews({
    specs: {
        spec1: '../specs/spec1.yaml'
    }
})
.then(result => {
    const view = result.spec1.view;
    view.addEventListener('mousedown', () => {
        addViews({
            specs: {
                spec2: '../specs/spec2.yaml'
            }
        });
    });
});
```
This example shows that you can call `addViews` repeatedly. Every spec must have a unique id so if you add another spec with id `spec1` in the example above, an error will be thrown. However you can overwrite existing specs if you set `overwrite` to `true` in the global settings.

### Example #4

```javascript
import { addViews, remove } from 'vega-multi-view';

addViews({
    specs: {
        spec1: '../specs/spec1.yaml'
    }
})
.then(result => {
    console.log(result) // { spec1: view...}
    setTimeout(() => {
        const result2 = removeViews('spec1');
        console.log(result2) // {}
    }, 3000);
});
```
This example shows how you can remove a view. The `removeViews` function takes a single id, a list of ids or an array of ids and returns the updated key-value store object. In this example the store is an empty object after we have removed the only view with id `spec`. Note that unlike `addViews` the `removeViews` function does not return a promise.

### Example #5

```javascript
import { addViews, removeViews } from '../../src/js/index';

const globalStylingCss = `
    html,
    body {
        color: white;
        background-color: #333;
        padding: 0;
        margin: 0;
    }

    .view {
        padding: 20px;
    }`
;

const spec4StylingCss = `
    .mark-path>path {
        fill: #C4FFC9 !important;
        fill-opacity: 0.3 !important;
        stroke-width: 0.1 !important;
    }

    .mark-path>path:hover {
        fill: #EEEA00 !important;
        fill-opacity: 1 !important;
        stroke-width: 5 !important;
        stroke: #00ffff !important;
    }`
;

const data = {
    styling: {
        css: globalStylingCss,
        addToHead: true,
        overwrite: false,
    },
    specs: {
        spec1: ['./specs/spec4.json', {
            element: 'map',
            leaflet: false,
            renderer: 'svg',
            styling: {
                css: spec4StylingCss,
                cssAppend: true,
                addToHead: true,
                classes: 'view',
            },
        }],
    },
    debug: true,
};

addViews(data)
    .then((result) => {
        console.log(result);
    });


```
This is an example of how you can add styling (only when using the SVG renderer). Note that we have to add `!important` to overrule the inline styling that the Vega renderer applies to the SVG elements. We set `cssAppend` to `true` to add the new styling rules to the existing ones.

## Add it to your own project

### Javascript

`vega-multi-view` is available both as esnext and commonjs module, and as UMD bundle.

#### Install for use as esnext or commonjs module

You can install `vega-multi-view` with npm or yarn:
```sh
# yarn
yarn add vega-multi-view

# npm
npm install --save vega-multi-view
```

#### Esnext (recommended)

Import the module to your javascript code:

```javascript
import { addViews, removeView } from 'vega-multi-view';
```

#### Commonjs

Import the module to your javascript code:

```javascript
const { addViews, removeView } =  require('vega-multi-view');
```

#### Coding like it's 1999

You can also add `vega-multi-view` as UMD bundle to your HTML page:

```html
<script src="https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.2/browser/vmv.js"></script>
```

Then in your plain es5 javascript code:

```javascript
// vega-multi-view is available via the global variable vmv
var addViews = window.vmv.addViews;

addViews({
    specs: {
        spec1: ['../specs/spec4.json', {
            element: 'container',
            leaflet: true
        }]
    },
    debug: true
}).then(function (result) {
    console.log(result);
}).catch(function (error) {
    console.error(error);
});
```

The module has a poly-fill for Promise so `then` and `catch` are supported in older browsers as well. The module is hosted on [rawgit](https://rawgit.com/) which is a CDN that caches files from Github and serves them with the correct MIME type. Note that rawgit does not guarantee 100% uptime. If your application requires 100% uptime you can download the javascript and css file (see below) and host it from another server.

### CSS

Both Leaflet and Vega-tooltip provide their own stylesheet and unless your project already includes Leaflet and/or Vega-tooltip you have to add them to your project. Best is to bundle them with the other stylesheets of your project. You can import the files in the main stylesheet of your project from the `node_modules` folder:

```sass
/* sass */
@import ./node_modules/leaflet/dist/leaflet
@import ./node_modules/vega-tooltip/build/vega-tooltip.min
```
```less
/* less */
@import './node_modules/leaflet/dist/leaflet'
@import './node_modules/vega-tooltip/build/vega-tooltip.min'
```

Note that you do not accidentally add the `.css` extension otherwise the css compiler will just add a css @import statement which triggers an extra HTTP request.

You can also add the pre-compiled stylesheet to your HTML page:

```html
<link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.2/browser/vmv.css" />
```

## See it in action

I made a related project called [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server) that is a simple REST API server that has a single endpoint that returns a global configuration based on the spec ids you send to the server.

It can return 1) an HTML page with the rendered Vega views, or 2) a JSON string that you can process further to your liking.

1) <http://app4.bigdator.nl/6a/6b/4b/8a/8b>
2) <http://app4.bigdator.nl/rest/simple.html>


### Example with REST API call:

Below the HTML that uses the UMD approach and loads the global configuration file via a REST API call.

```html
<!doctype html>
<html>

<head>
    <title>vega</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
    <link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.2/browser/vmv.css" />
    <script src="https://cdn.rawgit.com/abudaan/vega-multi-view/v1.1.2/browser/vmv.js"></script>
</head>

<body>
    <div id="container"></div>
    <script>
        // vega-multi-view is available via the global variable vmv
        var addViews = window.vmv.addViews;

        // feed the endpoint '/json' the parameters '6a' and '6b'
        var restApiUrl = '/json/6a/6b';

        // parse the global configuration and render the views
        addViews(restApiUrl)
            .then(function (result) {
                console.log(result);
            }).catch(function (error) {
                console.error(error);
            });
    </script>
</body>

</html>
```
