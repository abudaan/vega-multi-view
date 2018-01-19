import R from 'ramda';
import { parse, View } from 'vega';

const addElements = (data, container) => R.map((d) => {
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
    const bounds = divElement.getBoundingClientRect();
    // console.log(data.element, bounds);
    const pad = (typeof d.spec.padding === 'number') ? d.spec.padding : 0;
    // console.log('pad', pad, d.spec.padding);
    const {
        left: paddingLeft = pad,
        right: paddingRight = pad,
        top: paddingTop = pad,
        bottom: paddingBottom = pad,
    } = d.spec.padding;
    // console.log(paddingTop);
    // console.log(paddingRight);
    // console.log(paddingBottom);
    // console.log(paddingLeft);
    console.log(bounds);
    d.spec.width = bounds.width - paddingLeft - paddingRight;
    d.spec.height = bounds.height - paddingTop - paddingBottom;
    const view = new View(parse(d.spec));
    return {
        ...d,
        view,
        element: divElement,
        // parent: container,
    };
}, data);

export default addElements;
