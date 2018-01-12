import { changeset, version } from 'vega';
import { addViews } from '../../src/index';

console.log(`vega: ${version}`);

const data = {
    specs: {
        spec1: ['../specs/view1.change.json', {
            renderer: 'svg',
            publish: [
                {
                    signal: 'exportData',
                    as: 'updateFromView1',
                    // dataset: {
                    //     name: 'table',
                    //     action: 'replace_all',
                    //     action: 'replaceAll',
                    //     action: 'change',
                    //     action: 'remove',
                    //     action: 'insert',
                    // },
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
                    as: 'importData',
                    // dataReplace: true,
                    // dataModify: true,
                    // - dataset
                    // - field
                    // - value
                    // or: [{field, value}]
                },
            ],
        }],
    },
    debug: false,
};

addViews(data).then((result) => {
    console.log(result);
    result.spec1.view.addSignalListener('changeAmount', (a, b) => {
        const name = a;
        const category = b.datum.category;
        const amount = b.amount;
        // if (typeof category !== 'undefined') {
        //     // console.log(name, category, amount);
        //     // console.log(1, result.spec2.view.data('table'));
        //     const cs = changeset()
        //         .modify(d => d.category === category, 'amount', amount);
        //     result.spec2.view.change('table', cs).run();
        //     // console.log(2, result.spec2.view.data('table'));
        // }
    });
}).catch((error) => {
    console.error(error);
});
