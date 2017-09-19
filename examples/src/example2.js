import { addViews, removeViews } from '../../src/js/index';

const data = {
    specs: {
        spec1: ['./specs/spec4.json', {
            class: 'view',
            element: 'map',
            leaflet: false,
            renderer: 'svg',
        }],
    },
    debug: true,
    cssClass: 'view',
};

/*
const log = (msg) => {
    console.log(msg);
    return Promise.resolve();
};

const addViews1 = () => addViews(data);

const addViews2 = () => {
    data.overwrite = true;
    return addViews(data);
};

const removeViews1 = () => Promise.resolve(removeViews('spec1'));
*/

addViews(data)
    .then((result) => {
        console.log(1, result);
        // setTimeout(() => {
        //     data.overwrite = true;
        //     addViews(data)
        //         .then((result2) => {
        //             console.log(2, result2);
        //             setTimeout(() => {
        //                 const result3 = removeViews('spec1');
        //                 console.log(3, result3);
        //             }, 2000);
        //         });
        // }, 2000);
    });

