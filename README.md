# Vega multi view

This library is a wrapper of the Vega runtime API and allows you to add multiple separate Vega views to a HTML that can listen to each others signals.

It includes custom versions of [leaflet-vega](https://github.com/nyurik/leaflet-vega) and [vega-tooltip](https://github.com/vega/vega-tooltip).


## How to use

Basic example.

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

An array containing information about the rendered Vega view.
```javascript
{
    // Generated unique id
    id: '<string>'

    // Reference to the HTML Element that contains the Vega view
    element: '<HTMLElement>'

    // The Vega specification as javascript object (POJO)
    spec: '<Object>'

    // Reference to the rendered Vega view
    view: '<HTMLElement>'
}
```

## Config options
```javascript
{
    // Array containing all Vega specifications (specs) that will be
    // rendered to a Vega view, each view will be rendered in a separate
    // HTML element.
    // You can add both urls to Vega specifications and specification objects
    // as POJO
    specs: [
        './specs/world.vg.json',
        './specs/spec4a.json',
        spec,
    ],

    // The runtime information that will be used for the spec in the specs
    // array with the same index. So in this case we provide runtime data for
    // the third spec. You can also add the runtime information to the JSON file
    // of the spec; it will be stripped off the spec before the spec is passed
    // to the Vega parser.
    runtimes: [
        null,
        null,
        {
            element: false,
        },
    ],

    // The css class that will be added to every Vega view, can be
    // overridden in the view specific settings, see below
    cssClass: 'view',

    // All Vega views will be added to this HTML element, defaults
    // to document.body. Will be overridden if you specify an element
    // in the view specific settings, see below
    element: null,

    // Renderer to use for all Vega views, defaults to 'canvas'
    // can be overridden in the view specific settings, see below
    renderer: 'canvas',

    // Print signal and data updates to the console, defaults to false
    debug: false,

    // Call `run` on a Vega view after it has been added the the DOM,
    // defaults to false and can be overridden in the view specific
    // options, see below
    run: false,
}
```


## Runtime options

```javascript
{
    // Publish internal signals so other Vega views that live on
    // this HTML page can subscribe
    publish: [
        {
            signal: 'internal_signal_name',
            as: 'external_signal_name',
        },
    ],

    // Subscribe to a published signal of another Vega view that
    // lives on this HTML page
    subscribe: [
        {
            signal: 'external_signal_name',
            as: 'internal_signal_name',
        },
    ],

    // Renderer to use for this view, defaults to the renderer set
    // in the global options, see above
    renderer: 'canvas',

    // The Vega view will be rendered inside this HTML element
    // use 'false' for headless rendering. Overrides the value
    // of `container` in the global options, see above
    element: null,

    // The css class that will be added to the HTML element
    cssClass: null,

    // Render Vega view as leaflet layer
    leaflet: '<boolean>',

    // Call `run` on a Vega view after is has been added to the DOM,
    // overrides the global setting, see above
    run: '<boolean>',

    // Options that will be passed on to Vega tooltip
    tooltipOptions: {
        showAllFields: false,
        fields: [
            {
                formatType: 'string',
                field: 'fieldname',
                title: 'displayname',
            },
        ],
    },
```
