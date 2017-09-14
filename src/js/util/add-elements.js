import R from 'ramda';

const addElements = (data, container, className) => R.map((d) => {
    if (d.view === null) {
        return {
            ...d,
            element: null,
        };
    }
    let {
        element,
    } = d.vmvConfig;
    if (element === false) {
        // headless rendering
        element = null;
    } else if (R.isNil(element) === false) {
        if (typeof element === 'string') {
            element = document.getElementById(d.vmvConfig.element);
            if (R.isNil(element)) {
                // console.error(`element "${d.vmvConfig.element}" could not be found`);
                element = document.createElement('div');
                element.id = d.vmvConfig.element;
                container.appendChild(element);
            }
        } else if (element instanceof HTMLElement !== true) {
            console.error(`element "${d.vmvConfig.element}" is not a valid HTMLElement`);
            return {
                ...d,
                element: null,
            };
        }
    } else {
        element = document.createElement('div');
        element.id = d.id;
        if (typeof d.className === 'string') {
            element.className = d.className;
        } else if (typeof className === 'string') {
            element.className = className;
        }
        container.appendChild(element);
    }

    return {
        ...d,
        element,
        parent: container,
    };
}, data);

export default addElements;
