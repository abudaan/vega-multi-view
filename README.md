# Vega multi view

This library is a wrapper of the Vega runtime API that allows you to add multiple separate Vega views to a HTML page that can listen to each others signals. Separate means that every Vega view is rendered in a separate HTML element.

It includes custom versions of [leaflet-vega](https://github.com/nyurik/leaflet-vega) and [vega-tooltip](https://github.com/vega/vega-tooltip).


## Table of Contents

   * [Vega multi view](#vega-multi-view)
      * [Table of Contents](#table-of-contents)
      * [How to use](#how-to-use)
      * [Return value](#return-value)
      * [Terminology](#terminology)
      * [Global runtime configuration](#global-runtime-configuration)
      * [View specific runtime configuration](#view-specific-runtime-configuration)
         * [Leaflet](#leaflet)
         * [Publish and subscribe signals](#publish-and-subscribe-signals)
         * [Tooltips](#tooltips)
      * [More examples](#more-examples)
         * [Example #1](#example-1)
         * [Example #2](#example-2)
      * [Add it to your own project](#add-it-to-your-own-project)
         * [Javascript](#javascript)
         * [CSS](#css)
      * [See it in action](#see-it-in-action)

<small>(toc created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc))</small>

## How to use

Most Basic example:

```javascript
import createViews from 'vega-multi-view';

window.addEventListener('DOMContentLoaded', () => {
    const config = {
        specs: [
            './specs/spec1.json',
            './specs/spec2.json',
        ],
    };

    createViews(data)
        .then(result => console.log(result));
});
```

## Return value

After all views have been rendered tot the page an array containing information about the rendered Vega views is returned:
```javascript
{
    // Generated unique id
    id: '<string>'

    // Reference to the HTML Element that contains the Vega view
    element: '<HTMLElement>'

    // The Vega specification as javascript object (POJO)
    spec: '<Object>'

    // The runtime configuration
    config: '<Object>'

    // Reference to the HTML element that contains the rendered Vega
    // view
    view: '<HTMLElement>'
}
```

## Terminology

A `spec` is a Vega specification, it tells the [Vega runtime](https://github.com/vega/vega/wiki/Runtime) what to render on the page.

A `view` is the rendered instance of that spec on a HTML page.

The `vega-multi-view` wrapper applies settings to the Vega runtime *before* rendering, such as setting the renderer type (canvas or svg), and performs some extra steps *after* rendering, notably connecting the signals of the views.

The global configuration of vega-multi-view defines which specs will be added as views to you page, and you can set parameters that apply to the pre- and post-processing of these views.

With the view specific configuration you can override some of the global settings and add extra parameters that for instance tell vega-multi-view which signals to publish or subscribe to.

This view specific configuration can be added to a spec (inlined) or you can provide a configuration separately. You can also use no view specific configuration at all: then the view will be rendered with the global settings.

Both the global and the view specific configuration can be a javascript object, a JSON string, or a uri of a JSON, CSON or YAML file.

Let's see what these configurations looks like. Below I have chosen to use YAML because it provides a clear syntax but of course you can define your configuration in any supported format.

## Global runtime configuration


```yaml
---
# Print signal and data updates to the browser console. Defaults to
# false.
debug: false

# The element where all Vega views will be rendered to. Inside this
# element every view creates its own containing HTML element.
# If the element does not exist a div will be created and added to
# the body of the document. You can either specify an id (string)
# or a HTML element. Defaults to document.body.
element: id | HTMLElement

# Path to data sets and images that the Vega spec need to load.
dataPath: ./assets/data
imagePath: ./assets/img

# The css class or array of css classes that will be added to the
# view's containing HTML element, unless overridden by a view specific
# runtime configuration.
cssClass: class | [class1, class2]

# The renderer that will used for all views, unless overridden by a
# view specific runtime configuration.
renderer: canvas

# Whether or not to call the run() method of a view after is has been
# added to the DOM. Defaults to true and will be overridden by the
# view specific runtime configuration.
run: true

# Whether or not to call the hover() method of the view after it has
# been added to the page. Defaults to false and will be overridden by
# the view specific runtime configuration.
hover: false

# Array or a single spec, can be a uri of JSON or YAML file, a
# javascript object or a JSON string. You can add a view specific
# configuration to a spec by using a tuple.
specs: [
    {...},
    ../specs/spec1.yaml,
    [../specs/spec2.vg.json, ../conf/spec2.yaml]
]

```

Note that only the `specs` entry is mandatory. That is, you can leave it out but then nothing will be rendered.

The entries `dataPath` and `imagePath` are only useful if you generate or customize your Vega specs before rendering. For an example of how you can use `dataPath` and `imagePath` see the [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server).


## View specific runtime configuration

```yaml
---
# The spec this runtime configuration belongs to.
spec: spec_1

# The renderer to use this view
renderer: canvas

# The element where the view will be rendered to. If the element does
# not exist a div will be created and added to the body of the
# document. Use false (boolean) for headless # rendering
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

```
Note that because a spec can be rendered without a view specific configuration file as well, none of these entries are mandatory.

### Leaflet

Vega does not support tile maps but by using a custom version of [leaflet-vega](https://github.com/nyurik/leaflet-vega) we can render a Vega view to a layer in Leaflet. If you want to render your spec to a Leaflet layer your spec must define the signals `zoom` and `latitude` and `longitude`. You can read more about zoom, latitude and longitude in the Leaflet [documentation](http://leafletjs.com/examples/zoom-levels/)

vega-multi-view adds a Leaflet map to the HTML element as specified in the configuration and adds a Vega view layer to the map. If your spec does not specify one or all of the mandatory signals an error will be logged to the browser console and nothing will be rendered.

### Publish and subscribe signals

This is the core functionality of vega-multi-view that makes internal signals of views available for each other despite the fact that they all live in a separate HTML element. Both publish and subscribe use aliases so as to avoid name clashes.

For instance if 2 specs both have a signal named `hover` you can publish them with an alias to keep them apart, you could use the aliases `hover_spec1` and `hover_spec2`. Now other views can pick the signal they are interested in.

A common scenario is when a mouse over event in one view should triggers the hover of another view as well or when one spec sets a range in the data that is rendered by another spec.

Note that you define publish and subscribe aliases in the configuration of a view. This means that when the view is added to a page it might be possible that another spec has defined aliases with the same name. Therefor I recommend to prefix or suffix the names of your aliases with the filename or the name of the spec.

### Tooltips

The `vega-multi-view` uses Vega-tooltip, for more information see the [documentation](https://github.com/vega/vega-tooltip)

## More examples

Let's look at some more examples:

### Example #1

```javascript
import createViews from 'vega-multi-view';
import spec1 from '../specs/vega-spec1';

spec1.config = {
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
    specs: [
        spec1,
        ['../specs/spec2.yaml', {
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
    ]
};

createViews(data)
    .then(result => {
        const view1 = result[0].view;
        view1.hover();
    });

```

What we see here is two specs that respond to each other's hover signal.

The spec is imported as javascript object, then a configuration is added to the spec. You can safely add a `config` entry to a spec because it will be stripped off before the spec is passed to the Vega parser. If you have to load a spec from the server it saves you a HTTP request if you inline the view specific configuration in the spec.

The second spec is added as a tuple; the first element is always the spec, the second the configuration. Remember that both spec and configuration can be:

* a javascript object
* a JSON string
* a uri of a JSON, CSON, BSON or YAML file

Personally I find a Vega specs in YAML format the best readable. Also a YAML file is a bit smaller in file size compared to JSON.

In the resolve function of the `createViews` promise we have to enable hover event processing for spec1 because `hover` defaults to false and it hasn't been overridden in the view specific configuration. The configuration of spec2 has already overridden the global `hover` setting.

The [`vega-specs` project](https://github.com/abudaan/vega-specs) shows how you can create Vega specs in javascript and export them in several formats (JSON, BSON, CSON, YAML or as a template).

### Example #2

```javascript
import createViews from 'vega-multi-view';
import fetchYAML from '../util/fetch-helpers';

fetchYAML('../my-global-config.yaml')
    .then(data => createViews(data, 'yaml'))
    .then(result => {
        console.log(result)
    });

```
Here we see an example where the global configuration is loaded as a YAML file. Although the vega-multi-view is able to detect the type of files, you can make it a bit easier it you provide the type.

Note that you can not provide a type for view specific configurations or for the vega specs; in those cases vega-multi-view will detect it for you and log a warning to the browser console if the type can not be inferred.


## Add it to your own project

### Javascript

You can install vega-multi-view with npm or yarn:
```sh
# yarn
yarn add vega-multi-view

# npm
npm install --save vega-multi-view
```
Then in your javascript assuming you code in es2015 and up:
```javascript
import createViews from 'vega-multi-view';
```
Instead of `createViews` you can use any other name because it is the default export.

You can also import a util function that prints the spec in JSON format to a new tab:
```javascript
import createViews, { showSpecInTab } from 'vega-multi-view';
import spec from '../specs/my-spec';

button.addEventListener('click', () => {
    showSpecInTab(spec);
});
```

### CSS

Both Leaflet and Vega-tooltip provide their own stylesheet and unless your project already uses Leaflet and/or Vega-tooltip you have to add them to your project. Best is to bundle them with the other stylesheets of your project.

In the `dist` folder of the npm package you will find the file `vega-multi-view.css` that contains both the Leaflet and the Vega-tooltip css. You can import this file in the main stylesheet of your project:

```sass
/* sass */
@import ./node_modules/vega-multi-view/dist/vega-multi-view
```
```css
/* less */
@import './node_modules/vega-multi-view/dist/vega-multi-view'
```

Note that you don't add the .css extension otherwise the css compiler will just add a css @import statement.


## See it in action

You can see a live example [overhere](http://app4.bigdator.nl/6a/6b/4b/8a/8b). This is a related project called [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server) that adds Vega views to the page based in on the ids you add to the url. If you change the order of the ids in the url, the order of the views on the page will change accordingly.

