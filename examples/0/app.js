import { addViews, removeViews } from '../../src/js/index';
import generateSpec from '../specs/spec2';

const config = {
    dataPath: '../data',
    imagePath: '../img',
};

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
const spec = generateSpec(config);
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
// addViews(data)
//     .then(result => console.log(result));


// addViews({
//     specs: [
//         './specs/spec6a.json',
//         './specs/spec6b.json',
//     ],
// }).then(({ ids, views }) => {
//     console.log(ids, views);
//     const view = views[ids[0]].view;
//     view.addEventListener('mousedown', () => {
//         addViews({ specs: './specs/spec4a.json' })
//             .then(({ ids: ids2, views: views2 }) => {
//                 console.log(ids2, views2);
//                 setTimeout(() => {
//                     removeViews(ids[0], [...ids, 'aap'], 'beer', [['en', 'nog', 'meer']]);
//                 }, 500);
//             });
//     });
// });

const store = {};


const data2 = {
    // you can add urls to Vega specifications or specification objects
    specs: {
        // spec1: './specs/world.vg.json',
        spec2: './specs/spec4a.json',
        spec3: [spec, runtimeConfig],
    },
};

addViews(data2).then((result) => {
    console.log(result);
    // store = {
    //     ...store,
    //     ...views,
    // };
});

setTimeout(() => {
    addViews({
        specs: {
            spec1: 'aap',
            spec2: 'aap',
            spec3: 'aap',
            spec4: './specs/spec4a.json',
        },
    }).then(result => console.log(result));
}, 1000);

setTimeout(() => {
    addViews({
        specs: {
            spec2: 'aap',
            spec3: 'aap',
            spec1: './specs/spec4a.json',
        },
    }).then(result => console.log(result));
}, 2000);

setTimeout(() => {
    addViews({
        overwrite: true,
        specs: {
            spec2: './specs/spec6a.json',
        },
    }).then(result => console.log(result));
}, 3000);

// setTimeout(() => {
//     addViews({
//         specs: [
//             './specs/spec4a.json',
//         ],
//     }).then(result => console.log(result));
// }, 3000);

