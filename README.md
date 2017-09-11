# Vega multi view

This library is a wrapper of the Vega runtime API that allows you to add multiple separate Vega views to a HTML that can listen to each others signals. Separate means that every Vega view

It includes custom versions of [leaflet-vega](https://github.com/nyurik/leaflet-vega) and [vega-tooltip](https://github.com/vega/vega-tooltip).


## Table of Contents

   * [Vega multi view](#vega-multi-view)
      * [Table of Contents](#table-of-contents)
      * [How to use](#how-to-use)
      * [Return value](#return-value)
      * [Terminology: 'specs' and 'runtimes'](#terminology-specs-and-runtimes)
      * [Global runtime configuration](#global-runtime-configuration)
      * [View specific runtime configuration](#view-specific-runtime-configuration)
         * [Leaflet](#leaflet)
         * [Publish and subscribe signals](#publish-and-subscribe-signals)
         * [Tooltips](#tooltips)

Created by [gh-md-toc](https://github.com/ekalinin/github-markdown-toc)

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
    spec: '<Object>'

    // Reference to the HTML element that contains the rendered Vega
    // view
    view: '<HTMLElement>'
}
```

## Terminology: 'specs' and 'runtimes'

A `spec` is a Vega specification, it tells the [Vega runtime](https://github.com/vega/vega/wiki/Runtime) what to render on the page. A `runtime` is a small configuration object that tells the `vega-multi-view` wrapper how the rendered Vega view must be connected to other views.

A runtime can be added to a spec or you can provide a runtime separately. You can also use no runtime configuration at all: then the view will be rendered with the global settings of `vega-multi-view`. A runtime configuration can be a javascript object, a JSON string, or a uri of a JSON or YAML file.

## Global runtime configuration

The global runtime configuration defines which specs and runtimes add to the page and sets parameters that apply to all views. Let's see what it looks like:

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
# added to the DOM. Defaults to true and can be overridden by the view
# specific runtime configuration
run: true

# Array or a single spec, can be a uri of JSON or YAML file, a
# javascript object or a JSON string
specs: [{...}, ../specs/spec1.yaml, ../specs/spec2.vg.json]

# Array or a single runtime configuration, can be a uri of JSON or
# YAML file, a javascript object or a JSON string
runtimes: [null, ../specs/runtime.yaml, ../specs/runtime.json]
```

Note that only the `specs` entry is mandatory. That is, you can leave it out but then nothing will be rendered.

The `specs` array and the `runtimes` array share their indexes; the runtime at slot 2 in the runtimes array will be applied to the spec at slot 2 in the specs array. In the example above the first spec does not have an accompanying runtime configuration but the 2nd and 3rd do so we add `null` to the first slot of the array.

The entries `dataPath` and `imagePath` are only useful if you generate or customize your Vega specs before rendering. For an example of how you can use `dataPath` and `imagePath` see the [vega-multi-view-server](https://github.com/abudaan/vega-multi-view-server).


## View specific runtime configuration

Each view can use its own specific runtime configuration which overrides settings with the same name in the global runtime configuration. It looks like this:

```yaml
---
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

### Leaflet

Vega does not support tile maps but by using a custom version of [leaflet-vega](https://github.com/nyurik/leaflet-vega) we can render a Vega view to a layer in Leaflet. If you want to render your spec to a Leaflet layer your spec must define the signals `zoom` and `latitude` and `longitude`. You can read more about zoom, latitude and longitude in the Leaflet [documentation](http://leafletjs.com/examples/zoom-levels/)

The `vega-multi-view` adds a Leaflet map to the HTML element as specified in the runtime configuration and adds a Vega view layer to the map. If your spec does not specify one or all of the mandatory signals an error will be logged to the browser console and nothing will be rendered.

### Publish and subscribe signals

This is the core functionality of `vega-multi-view` that makes signals of views available for each other despite the fact that they all live in a separate HTML element. Both publish and subscribe use aliases so as to avoid name clashes.

For instance if 2 specs both have a signal named `hover` you can publish them with an alias to keep them apart, you could use the aliases `hover_spec1` and `hover_spec2`. Now other views can subscribe to the signal they are interested in.

A common scenario is when a mouse over event in one view should trigger the hover of another view as well or when one spec sets a range in the data that is rendered by another spec.

Note that you define publish and subscribe aliases in the runtime configuration of a view. This means that it is possible that when you add the view to a page it might be possible that another spec has defined aliases with the same name. Therefor I recommend to use the name or filename of the spec as a prefix or suffix of your aliases.

### Tooltips

The `vega-multi-view` uses Vega-tooltip, for more informations see the [documentation](https://github.com/vega/vega-tooltip)

## More advanced examples

Let's look at some more advanced usage examples:

```javascript
import createViews from 'vega-multi-view';
import spec from '../specs/vega-spec1';

spec.runtime = {
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
    specs: [spec, '../specs/spec2.yaml'],
    runtimes: [
        null,
        {
            element: 'divSpec2'
        }
    ]
};

createViews(data)
    .then(result => {
        const view1 = result[0].view;
        const view2 = result[1].view;
        view1.hover();
        view2.hover();
    });

```


```javascript
import createViews from 'vega-multi-view';
import fetchYAML from '../util/fetch-helpers';

fetchYAML('../my-global-config.yaml')
    .then(data => createViews(data, 'yaml'))
    .then(result => {
        console.log(result)
    });

```

@TODO:
- add type
- runtime will be stripped off the spec before the spec is passed to the Vega parser

