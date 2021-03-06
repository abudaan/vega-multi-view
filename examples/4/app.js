import { addViews, removeViews } from '../../src/index';

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
    '.view2': {
        width: '100%',
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
        background-color: red;
        padding: 20px;
    }

    .view2 {
        /* width: 100%; */
    }
`;

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
        class: 'view',
        css: globalStylingCss,
        addToHead: true,
    },
    specs: {
        spec1: ['../specs/spec4.json', {
            // element: 'map',
            leaflet: false,
            renderer: 'svg',
            styling: {
                classes: ['view', 'view2'],
                css: spec4StylingCss,
                addToHead: true,
            },
        }],
    },
    debug: true,
};

addViews(data)
    .then((result) => {
        console.log(result);
        const css1 = `.view {
            background-color: yellow !important;
        }`;
        const css2 = `.mark-path>path {
            stroke: red !important;
        }`;
        setTimeout(() => {
            const data1 = {
                styling: {
                    css: css1,
                    addToHead: true,
                    overwrite: false,
                },
                specs: {
                    spec2: ['../specs/spec4.json', {
                        leaflet: false,
                        renderer: 'svg',
                        styling: {
                            classes: 'view',
                            css: css2,
                            addToHead: true,
                        },
                    }],
                },
            };
            addViews(data1);
        }, 5000);
    });

