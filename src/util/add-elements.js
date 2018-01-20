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

    // assume responsive if no width or height has been defined in the spec
    if ((R.isNil(d.spec.width) || R.isNil(d.spec.height)) || d.vmvConfig.responsive === true) {
        const bounds = divElement.getBoundingClientRect();
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
        d.spec.width = bounds.width - paddingLeft - paddingRight;
        d.spec.height = bounds.height - paddingTop - paddingBottom;
    }
    const view = new View(parse(d.spec));
    return {
        ...d,
        view,
        element: divElement,
    };
}, data);

export default addElements;
