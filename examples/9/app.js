import { addViews, vega } from '../../src/index';

console.log('vega', vega);

const data = {
    specs: {
        spec1: ['../specs/dataset_change_view1.yaml', {
            renderer: 'svg',
            publish: [
                {
                    signal: 'exportData',
                    as: 'updateFromView1',
                    query: {
                        name: 'table',
                        action: 'replace_all',
                        // action: 'change',
                        // select: {
                        //     field: 'category',
                        //     test: '==',
                        // },
                        // update: {
                        //     fields: ['amount', 'color'],
                        // },
                    },
                },
                {
                    signal: 'tooltip',
                    as: 'hover1',
                },
            ],
            // subscribe: [
            //     {
            //         signal: 'updateFromView2',12
            //         dataUpdate: true,
            //     },
            // ],
        }],
        spec2: ['../specs/view2.vg.json', {
            renderer: 'svg',
            publish: [
                {
                    // signal: 'exportData',
                    // as: 'updateFromView2',
                    // dataUpdate: true,
                },
            ],
            subscribe: [
                {
                    signal: 'updateFromView1',
                    query: {
                        action: 'update_all',
                    },
                },
                {
                    signal: 'hover1',
                    as: 'info',
                },
            ],
        }],
    },
    debug: false,
};

addViews(data).then((result) => {
    console.log(result);
}).catch((error) => {
    console.error(error);
});
