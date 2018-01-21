import R from 'ramda';
import { parse, View } from 'vega';

const addElements = (data, container) => R.map((d) => {
    console.log(d);
    if (d.vmvConfig === null) {
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
    // /*
    // For Chrome browsers:
    // if no width or height has been set in the spec, the missing value(s) will be set to the
    // containing element's width and / or height
    if (R.isNil(d.spec.width) || R.isNil(d.spec.height) || d.spec.width === 0 || d.spec.height === 0) {
        const bounds = divElement.getBoundingClientRect();
        const width = d.spec.width || bounds.width;
        const height = d.spec.height || bounds.height;
        // check if the padding is set as an object or as a numeric value for all each padding side
        const pad = (typeof d.spec.padding === 'number') ? d.spec.padding : 0;
        const {
            left: paddingLeft = pad,
            right: paddingRight = pad,
            top: paddingTop = pad,
            bottom: paddingBottom = pad,
        } = d.spec.padding || {};
        // put the width and the height in the spec; otherwise the view won't be visible
        // the first time the spec is rendered to the page
        d.spec.width = width - paddingLeft - paddingRight;
        d.spec.height = height - paddingTop - paddingBottom;
    }
    // */
    const view = new View(parse(d.spec));
    return {
        ...d,
        view,
        element: divElement,
    };
}, data);

export default addElements;
