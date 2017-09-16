import { addViews, removeViews } from '../../src/js/index';

const data = {
    specs: {
        spec1: './specs/spec4a.json',
    },
    debug: true,
    cssClass: 'view',
};
addViews(data)
    .then(result => console.log(result));

