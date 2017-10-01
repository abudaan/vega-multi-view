// import { addViews, removeViews } from '../../src/js/index';
// const vmv = require('../../src/js/index');
const { addViews, removeViews, version } = require('../../src/index');

console.log(version);

addViews({
    specs: {
        spec1: ['../specs/spec4.json', {
            element: 'container',
            leaflet: true,
        }],
    },
    debug: true,
}).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});
