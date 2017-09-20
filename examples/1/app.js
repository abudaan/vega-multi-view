import { addViews, removeViews } from '../../src/js/index';

const vmvConfig1 = {
    publish: [
        {
            signal: 'buurt_hover_naam',
            as: 'hover_hood',
        },
    ],
    renderer: 'canvas',
    element: null,
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
const vmvConfig2 = {
    subscribe: [
        {
            signal: 'hover_hood',
            as: 'show_hood',
        },
    ],
};

const data = {
    specs: {
        // spec2: ['./specs/world.vg.json', vmvConfig2],
        // spec1: ['./specs/spec4.json', vmvConfig1],
        spec1: './specs/spec4a.json',
    },
    debug: true,
    cssClass: 'view',
    // element: document.getElementById('container'),
};
addViews(data)
    .then(result => console.log(result));

