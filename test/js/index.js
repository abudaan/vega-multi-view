import createViews from '../../src/js/index';
import generateSpec from '../specs/spec2';
import config from './util/config';

window.addEventListener('DOMContentLoaded', () => {
    const runtimeConfig = {
        publish: [
            {
                signal: 'buurt_hover_naam',
                as: 'hover',
            },
        ],
        subscribe: [
            {
                signal: 'buurt_clicked',
                as: 'click',
            },
        ],
        renderer: 'canvas', // default value
        element: null, // use 'false' for headless rendering
        className: null,
        leaflet: true,
        tooltipOptions: {
            showAllFields: false,
            fields: [
                {
                    formatType: 'string',
                    field: 'properties.NAAM',
                    title: 'buurt',
                },
                {
                    formatType: 'string',
                    field: 'properties.CODE',
                    title: 'code',
                },
                {
                    formatType: 'string',
                    field: 'properties.TYPE',
                    title: 'type',
                },
            ],
        },
    };
    const spec = generateSpec(config());
    const data = {
        // you can add urls to Vega specifications or specification objects
        specs: [
            './specs/world.vg.json',
            './specs/spec4a.json',
            [spec, runtimeConfig],
        ],
        // css class that will be applied to every rendered vega spec
        // unless you overrule the cssClass property in the runtime
        // object
        cssClass: 'view',
        // the HTML element where all the specs will be added to, defaults
        // to document.body
        element: document.getElementById('container'),
    };
    // createViews(data)
    //     .then(result => console.log(result));
    createViews({
        specs: [
            './specs/spec6a.json',
            './specs/spec6b.json',
        ],
    }).then((result) => {
        const view = result[0].view;
        view.addEventListener('mousedown', () => {
            createViews({ specs: './specs/spec4a.json' });
        });
    });

    // setTimeout(() => {
    //     createViews({
    //         specs: [
    //             './specs/spec4a.json',
    //         ],
    //     }).then(result => console.log(result));
    // }, 3000);
});

