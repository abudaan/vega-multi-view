import R from 'ramda';
import { changeset } from 'vega';

const change = (view, query, signal) => {
    /*
        example query:

        query:
            dataset: table
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
        const {
            dataset,
            select,
            update,
        } = query;
        const cs = changeset();
        signal.forEach((tuple) => {
            let i = 0;
            R.tail(tuple).forEach((value) => {
                const field = update.fields[i];
                i += 1;
                if (value !== null) {
                    if (select.test === '==') {
                        cs.modify(d => d[select.field] === tuple[0], field, value);
                    } else if (select.test === '!=') {
                        cs.modify(d => d[select.field] !== tuple[0], field, value);
                    } else if (select.test === '<') {
                        cs.modify(d => d[select.field] < tuple[0], field, value);
                    } else if (select.test === '>') {
                        cs.modify(d => d[select.field] > tuple[0], field, value);
                    }
                }
            });
        });
        view.change(dataset, cs).run();
    }
};

const remove = (view, query, signal) => {
    if (Array.isArray(signal)) {
        const {
            dataset,
            select,
            update,
        } = query;
        const cs = changeset();
        signal.forEach((tuple) => {
            let i = 0;
            R.tail(tuple).forEach((value) => {
                const field = update.fields[i];
                i += 1;
                if (value !== null) {
                    if (select.test === '==') {
                        cs.remove(d => d[select.field] === tuple[0], field, value);
                    } else if (select.test === '!=') {
                        cs.remove(d => d[select.field] !== tuple[0], field, value);
                    } else if (select.test === '<') {
                        cs.remove(d => d[select.field] < tuple[0], field, value);
                    } else if (select.test === '>') {
                        cs.remove(d => d[select.field] > tuple[0], field, value);
                    }
                }
            });
        });
        view.change(dataset, cs).run();
    }
};

const insert = (view, query, signal) => {
    if (Array.isArray(signal)) {
        const { dataset } = query;
        const cs = changeset();
        signal.forEach((tuple) => {
            cs.insert(dataset, tuple);
        });
        view.change(dataset, cs).run();
    }
};

const replaceDataset = (view, query, signal) => {
    const { dataset } = query;
    view.remove(dataset, () => true).run();
    view.insert(dataset, signal).run();
};

const removeDataset = (view, query) => {
    const { dataset } = query;
    view.remove(dataset, () => true).run();
    view.insert(dataset, {}).run();
};

export {
    change,
    insert,
    remove,
    replaceDataset,
    removeDataset,
};
