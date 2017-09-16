import R from 'ramda';

const addElements = (data, container, className) => R.map((d) => {
    if (d.view === null) {
        return {
            ...d,
            element: null,
        };
    }
    const {
        element,
    } = d.vmvConfig;

    // default is headless rendering
    let divElement = null;
    if (typeof element === 'string') {
        divElement = document.getElementById(element);
        if (divElement === null) {
            // console.error(`element "${element}" could not be found`);
            divElement = document.createElement('div');
            divElement.id = element;
            container.appendChild(divElement);
        }
    } else if (element instanceof HTMLElement) {
        if (document.getElementById(element.id) === null) {
            container.appendChild(element);
        }
        divElement = element;
    } else if (typeof element !== 'undefined') {
        console.error(`element "${element}" is not an id or a valid HTMLElement`);
        return {
            ...d,
            element: null,
        };
    } else {
        divElement = document.createElement('div');
        divElement.id = d.id;
        container.appendChild(divElement);
    }

    if (typeof d.className === 'string') {
        divElement.className = d.className;
    } else if (typeof className === 'string') {
        divElement.className = className;
    }

    return {
        ...d,
        element: divElement,
        // parent: container,
    };
}, data);

export default addElements;
