import { version } from 'vega';
import { addViews, version as vmvVersion } from '../../src/index';

console.log('vmv', vmvVersion);
console.log('vega', version);

const vmvConfig = {
    cssClass: null,
    element: 'example-10',
    // leaflet: true,
    // publish: [
    //     {
    //         as: 'hover',
    //         signal: 'buurt_hover_naam',
    //     },
    // ],
    // renderer: 'canvas',
    // tooltipOptions: {
    //     fields: [
    //         {
    //             field: 'properties.NAAM',
    //             formatType: 'string',
    //             title: 'buurt',
    //         },
    //         {
    //             field: 'properties.CODE',
    //             formatType: 'string',
    //             title: 'code',
    //         },
    //         {
    //             field: 'properties.TYPE',
    //             formatType: 'string',
    //             title: 'type',
    //         },
    //     ],
    //     showAllFields: false,
    // },
};


const data = {
    specs: {
        // spec1: ['../specs/map.yaml', vmvConfig],
        spec1: ['../specs/bars_resize.yaml', vmvConfig],
    },
    debug: true,
};

addViews(data).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});
