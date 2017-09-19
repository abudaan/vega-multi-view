# Vega multi view

This library is a wrapper of the Vega runtime API that allows you to add multiple Vega views to a HTML page that can listen to each others signals, despite the fact that each view lives in a separate HTML element.

It includes [vega-tooltip](https://github.com/vega/vega-tooltip) and [vega-as-leaflet-layer](https://github.com/abudaan/vega-as-leaflet-layer) which is based on [leaflet-vega](https://github.com/nyurik/leaflet-vega).


## Table of Contents

   * [Vega multi view](#vega-multi-view)
      * [Table of Contents](#table-of-contents)
      * [How to use](#how-to-use)
      * [Return value](#return-value)
      * [Terminology](#terminology)
      * [Global configuration](#global-configuration)
      * [View specific configuration](#view-specific-configuration)
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

## Return value

After all views have been added to the page, a key-value store object containing information about each view is returned. Information per view:
```javascript
{
    // The id as you have set it in the specs object (see below)
    id: 'string'

    // Reference to the HTML Element that contains the Vega view
    element: '<HTMLElement>'

    // The Vega specification as javascript object (POJO)
    spec: '<Object>'

    // The view specific configuration
    vmvConfig: '<Object>'

    // Reference to the HTML element that contains the rendered Vega
    // view
    view: '<HTMLElement>'
}
```

## Terminology

A `spec` is a Vega specification, it tells the [Vega runtime](https://github.com/vega/vega/wiki/Runtime) what to render on the page.

A `view` is the rendered instance of that spec on a HTML page.

The `vega-multi-view` wrapper applies settings to the Vega runtime *before* rendering, such as setting the renderer type (canvas or svg), and performs some extra steps *after* rendering, notably connecting the signals of the views.

The global configuration of `vega-multi-view` defines which specs will be added as views to your page, and you can set parameters that are applied to the pre- and post-processing of these views.

With the view specific configuration you can override some of the global settings and add extra parameters that for instance tell `vega-multi-view` which signals to publish or to subscribe to.

This view specific configuration can be added to a spec (inlined), for this you can use the key `vmvConfig` (see [example #1](#example-1) below). You can also provide a configuration separately. It is also possible to use no view specific configuration at all: then the view will be rendered with the global settings.

Both the global and the view specific configuration, as well as the Vega spec can be:
* a javascript object (POJO)
* a JSON string
* a uri of a JSON, BSON, CSON or YAML file.

Let's see what the configurations look like. Below I have chosen to use YAML because it provides a clear syntax but of course you can define your configuration in any supported format.

## Global configuration


```yaml
---
# Print signal and data updates to the browser console. Defaults to
# false.
debug: false

# Whether or not an existing spec in the store will be overwritten by
# a spec with the same id that is added afterwards.
overwrite: false

# The element where all Vega views will be rendered to. Inside this
# element every view creates its own containing HTML element.
# If the element does not exist a div will be created and added to
# the body of the document. You can either specify an id (string)
# or a HTML element. Defaults to document.body.
element: id | HTMLElement

# Path to data sets and images that the Vega spec needs to load.
dataPath: ./assets/data
imagePath: ./assets/img

# The css class or array of css classes that will be added to the
# view's containing HTML element, unless overridden by a view specific
# configuration.
cssClass: class | [class1, class2]

# The renderer that will used for all views, unless overridden by a
# view specific configuration.
renderer: canvas

# Whether or not to call the run() method of a view after it has been
# added to the DOM. Defaults to true and will be overridden by a
# view specific configuration.
run: true

# Whether or not to call the hover() method of the view after it has
# been added to the page. Defaults to false and will be overridden by
# a view specific configuration.
hover: false

# A key-value store object where the keys are the unique ids by which
# the Vega specs can be identified. The value is a single spec or a
# tuple, in case you set a tuple the second value is the view specific
# configuration file (see below). Both the spec and the configuration
# can be any of the types listed above.
specs:
    spec1: ../specs/spec1.yaml,
    spec2: [../specs/spec2.vg.json, ../conf/spec2.yaml]

# Add styling that applies to all views and / or containing elements
# of the views. You can add the URI of an external css file or inline
# the styling as text. If you set values for both url and css, the
# value set for css will prevail.
# The setting addToHead defaults to false, if you set it to
# true the styling will be added to the head of the page before the
# Vega view gets rendered. If you set it to false, you can bundle all
# styles on the server before sending to the client.
# If you set overwrite to false, the new styling rules will be added
# to the existing rules. Defaults to false which means that existing
# rules will be replaced. This option only works if you add the
# styling as css text.
styling:
    url: ../css/view1.css
    css: 'div {color: red}'
    addToHead: false
    overwrite: true
```

Note that only the `specs` entry is mandatory. That is, you can leave it out but then nothing will be rendered.

The entries `dataPath` and `imagePath` are only useful if you generate or customize your Vega specs before rendering. For an example of how you can use `dataPath` and `imagePath` see the [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server).


## View specific configuration

```yaml
---
# The spec this configuration belongs to.
spec: spec_1

# The renderer to use this view
renderer: canvas

# The element where the view will be rendered to. If the element does
# not exist a div will be created and added to the HTML element that
# is set in the global settings. Use false (boolean) for headless
# rendering.
element: id | HTMLElement

# The css class or array of css classes that will be added to the
# containing HTML element.
cssClass: view | [class1, class2]

# Whether or not to call the run() method of the view after it has
# been added to the page. Defaults to true.
run: true

# Whether or not to call the hover() method of the view after it has
# been added to the page. Defaults to false.
hover: false

# Whether or not the Vega view should be added as a layer to a Leaflet
# map. Defaults to false.
leaflet: false

# A signal or array of signals that will be available for the other
# views to listen to.
publish:
    - signal: internalSignalName1
      as: externalSignalName1
    - signal: internalSignalName2
      as: externalSignalName2

# A signal or array of signals originating from another view that this
# view wants to listen to.
subscribe:
    signal: externalSignalNameOfAnotherView
    as: internalSignalName2

# The options that will be passed on to vega-tooltip for rendering
# custom tooltips on top of the view.
tooltipOptions:
    showAllFields: false
    fields:
        - formatType: string
          field: fieldName
          title: displayName

# Add view specific styling to the view. You can add the URI of an
# external css file or inline the styling as text. If you set values
# for both url and css, the value set for css will prevail.
# The setting addToHead defaults to false, if you set it to
# true the styling will be added to the head of the page before the
# Vega view gets rendered. If you set it to false, you can bundle all
# styles on the server before sending to the client.
# If you set overwrite to false, the new styling rules will be added
# to the existing rules of the view. Defaults to false which means
# that existing rules will be replaced. This option only works if
# you add the styling as css text.
styling:
    url: ../css/view1.css
    css: 'div {color: red}'
    addToHead: false
    overwrite: true
```
Note that because a spec can be rendered without a view specific configuration file as well, none of these entries are mandatory.

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

The second spec is added as a tuple; the first element is always the spec, the second the configuration. Remember that both spec and configuration can be:

* a javascript object (POJO)
* a JSON string
* a uri of a JSON, BSON, CSON or YAML file.

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
            class: 'view',
            element: 'map',
            leaflet: false,
            renderer: 'svg',
            styling: {
                css: spec4StylingCss,
                addToHead: true,
                overwrite: false,
            },
        }],
    },
    debug: true,
    cssClass: 'view',
};

addViews(data)
    .then((result) => {
        console.log(result);
    });


```
This is an example of how you can add styling. Note that we have to add `!important` to overrule the inline styling that the Vega renderer applies to the Canvas element if you use the canvas renderer or to the SVG elements if you use the SVG renderer. We set `overwrite` to `false` add the new styling rules to the existing rules.

## Add it to your own project

### Javascript

You can install `vega-multi-view` with npm or yarn:
```sh
# yarn
yarn add vega-multi-view

# npm
npm install --save vega-multi-view
```
Then in your javascript assuming you code in es2015 and up:
```javascript
import { addViews, removeView } from 'vega-multi-view';
```
You can also import a util function that prints the spec in JSON format to a new tab:
```javascript
import { showSpecInTab } from 'vega-multi-view';
import spec from '../specs/my-spec';

button.addEventListener('click', () => {
    showSpecInTab(spec);
});
```

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


## See it in action

You can see a live example [overhere](http://app4.bigdator.nl/6a/6b/4b/8a/8b). This is a related project called [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server) that adds Vega views to the page based in on the ids you add to the url. If you change the order of the ids in the url, the order of the views on the page will change accordingly.

