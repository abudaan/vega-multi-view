import { addViews, removeViews } from '../../src/index';

const data = {
    specs: {
        spec1: ['./specs/spec4.json', {
            class: 'view',
            element: 'map',
            leaflet: false,
            renderer: 'svg',
        }],
    },
    debug: false,
    cssClass: 'view',
};

addViews(data)
    .then((result) => {
        console.log(result);
    });

