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
                if (value !== null) {
                    if (dataset.select.test === '==') {
                        cs.modify(d => d[dataset.select.field] === tuple[0], field, value);
                    } else if (dataset.select.test === '!=') {
                        cs.modify(d => d[dataset.select.field] !== tuple[0], field, value);
                    } else if (dataset.select.test === '<') {
                        cs.modify(d => d[dataset.select.field] < tuple[0], field, value);
                    } else if (dataset.select.test === '>') {
                        cs.modify(d => d[dataset.select.field] > tuple[0], field, value);
                    }
                }
            });
        });
        view.change(publish.dataset.name, cs).run();
    }
};

const remove = (view, publish, signal) => {
    if (Array.isArray(signal)) {
        const { dataset } = publish;
        const cs = changeset();
        signal.forEach((tuple) => {
            let i = 0;
            R.tail(tuple).forEach((value) => {
                const field = dataset.update.fields[i];
                i += 1;
                if (value !== null) {
                    if (dataset.select.test === '==') {
                        cs.remove(d => d[dataset.select.field] === tuple[0], field, value);
                    } else if (dataset.select.test === '!=') {
                        cs.remove(d => d[dataset.select.field] !== tuple[0], field, value);
                    } else if (dataset.select.test === '<') {
                        cs.remove(d => d[dataset.select.field] < tuple[0], field, value);
                    } else if (dataset.select.test === '>') {
                        cs.remove(d => d[dataset.select.field] > tuple[0], field, value);
                    }
                }
            });
        });
        view.change(publish.dataset.name, cs).run();
    }
};

const insert = (view, publish, signal) => {
    if (Array.isArray(signal)) {
        const { dataset } = publish;
        const cs = changeset();
        signal.forEach((tuple) => {
            cs.insert(dataset.name, tuple);
        });
        view.change(publish.dataset.name, cs).run();
    }
};

const replaceDataset = (view, publish, signal) => {
    const { dataset } = publish;
    view.remove(dataset.name, () => true).run();
    view.insert(dataset.name, signal).run();
};

const removeDataset = (view, publish) => {
    const { dataset } = publish;
    view.remove(dataset.name, () => true).run();
    view.insert(dataset.name, {}).run();
};

export {
    change,
    insert,
    remove,
    replaceDataset,
    removeDataset,
};
