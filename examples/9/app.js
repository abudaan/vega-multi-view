import { addViews } from '../../src/index';

const data = {
    specs: {
        spec1: ['../specs/dataset_change_view1.yaml', {
            renderer: 'svg',
            publish: [
                {
                    signal: 'exportData',
                    as: 'updateFromView1',
                    dataset: {
                        name: 'table',
                        action: 'change',
                        select: {
                            field: 'category',
                            test: '==',
                        },
                        update: {
                            fields: ['amount', 'color'],
                        },
                    },
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
            // publish: [
            //     {
            //         // signal: 'exportData',
            //         // as: 'updateFromView2',
            //         // dataUpdate: true,
            //     },
            // ],
            subscribe: [
                {
                    signal: 'updateFromView1',
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
