import { addViews, removeViews } from '../../src/js/index';


const globalStylingJson = {
    html: {
        color: 'white',
        'background-color': '#333',
        padding: 0,
        margin: 0,
    },
    body: {
        color: 'white',
        'background-color': '#333',
        padding: 0,
        margin: 0,
    },
    '.view': {
        padding: '20px',
    },
};

const globalStylingCss = `
    html,
    body {
        color: white;
        background-color: #333;
        padding: 0;
        margin: 0;
    }

    .view {
        /* background-color: #F700FF !important; */
        padding: 20px;
    }`;

const spec4StylingJson = {
    '.mark-path>path': {
        fill: '#C4FFC9 !important',
        'fill-opacity': '0.3 !important',
        'stroke-width': '0.1 !important',
    },
    '.mark-path>path:hover': {
        fill: '#EEEA00 !important',
        'fill-opacity': '1 !important',
        'stroke-width': '5 !important',
        stroke: '#00ffff !important',
    },
};

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
    }`;

const data = {
    styling: {
        // json: globalStylingJson,
        css: globalStylingCss,
        addToHead: true,
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
            },
        }],
    },
    debug: true,
    cssClass: 'view',
};

addViews(data)
    .then((result) => {
        console.log(result);
        const css = `.view {
            background-color: yellow;
        }`;
        // setTimeout(() => {
        //     const data1 = {
        //         styling: {
        //             css,
        //             addToHead: true,
        //             overwrite: false,
        //         },
        //         specs: {
        //             spec2: ['./specs/spec4.json', {
        //                 class: 'view',
        //                 leaflet: false,
        //                 renderer: 'svg',
        //             }],
        //         },
        //     };
        //     addViews(data1);
        // }, 4000);
    });

