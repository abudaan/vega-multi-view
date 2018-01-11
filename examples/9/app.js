// import { addViews, removeViews } from '../../src/js/index';
// const vmv = require('../../src/js/index');
const { addViews, removeViews } = require('../../src/index');

const data = {
    specs: {
        spec1: ['../specs/view1.vg.json', {
            renderer: 'svg',
            publish: [
                {
                    signal: 'exportData',
                    as: 'updateFromView1',
                    dataUpdate: true,
                },
            ],
            subscribe: [
                {
                    signal: 'updateFromView2',
                    dataUpdate: true,
                },
            ],
        }],
        spec2: ['../specs/view2.vg.json', {
            renderer: 'svg',
            publish: [
                {
                    signal: 'exportData',
                    as: 'updateFromView2',
                    dataUpdate: true,
                },
            ],
            subscribe: [
                {
                    signal: 'updateFromView1',
                    dataUpdate: true,
                },
            ],
        }],
    },
    debug: false,
};

addViews(data).then((result) => {
    console.log(result);
    // result.spec1.view.addSignalListener('dataUpdate', (a, b) => {
    //     //  console.log(a, b);
    //     // result.spec2.view.remove(b.name, () => true).run();
    //     // result.spec2.view.insert(b.name, b.values).run();
    // });
}).catch((error) => {
    console.error(error);
});
