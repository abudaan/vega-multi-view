import R from 'ramda';
import { changeset } from 'vega';

const change = (view, publish, signal) => {
    /*
        example publish:

        dataset:
            name: table
            action: change
            select:
                field: category
                test: ==
            update:
                fields:
                    - amount
                    - color


        example signal:

        dataset: table
        action: change
        values:
            -   select:
                    test: ==
                    field: category
                    value: selectedCategory.category
                update:
                    field: amount
                    value: changeAmount.amount
            -   select:
                    test: '=='
                    field: 'category'
                    value: 'A'
            -   update:
                    field: 'amount'
                    value: changeAmount.amount * 0.2
            -   select:
                    test: '=='
                    field: 'category'
                    value: 'A'
            -   update:
                    field: 'color'
                    value: red
    */

    if (Array.isArray(signal)) {
        const { dataset } = publish;
        const cs = changeset();
        signal.forEach((tuple) => {
            let i = 0;
            R.tail(tuple).forEach((value) => {
                const field = dataset.update.fields[i];
                i += 1;
                if (dataset.select.test === '==') {
                    cs.modify(d => d[dataset.select.field] === tuple[0], field, value);
                }
            });
        });
        view.change(publish.dataset.name, cs).run();
    }
};


const replaceAll = (view, publish, value) => {
    view.remove(publish.dataset.name, () => true).run();
    view.insert(publish.dataset.name, value).run();
};

export {
    change,
    replaceAll,
};
