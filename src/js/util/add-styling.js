import R from 'ramda';

const head = document.getElementsByTagName('head').item(0);

let index = 0;
const addStyling = (id, styling, divElement, globalStyling = {}) => {
    const {
        url = null,
        css = null,
        cssAppend = true, // only for global styling
        addToHead = false,
        classes = null,
        classesAppend = true,
    } = styling;

    let viewClasses = [];
    let globalClasses = [];
    if (typeof classes === 'string') {
        viewClasses = [classes];
    } else if (Array.isArray(classes)) {
        viewClasses = classes;
    }
    if (typeof globalStyling.classes === 'string') {
        globalClasses = [globalStyling.classes];
    } else if (Array.isArray(globalStyling.classes)) {
        globalClasses = globalStyling.classes;
    }

    if (classesAppend === true) {
        divElement.className = [...globalClasses, ...viewClasses].join(' ');
    } else if (viewClasses.length > 0) {
        divElement.className = viewClasses.join(' ');
    } else if (globalClasses.length > 0) {
        divElement.className = globalClasses.join(' ');
    } else {
        divElement.className = '';
    }

    if (addToHead === true) {
        if (typeof css === 'string') {
            let style = document.getElementById(`style-${id}`);
            if (style === null) {
                style = document.createElement('style');
                style.id = `style-${id}`;
                style.type = 'text/css';
                head.appendChild(style);
            }
            const text = document.createTextNode(css);
            if (cssAppend === false) {
                style.innerHTML = '';
            }
            style.appendChild(text);
        } else if (typeof url === 'string') {
            const links = document.querySelectorAll(`id^=${id}`);
            if (cssAppend === false) {
                links.forEach((link) => {
                    head.removeChild(link);
                });
            }
            const link = document.createElement('link');
            link.id = `id-${index}`;
            link.type = 'text/css';
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('href', url);
            head.appendChild(link);
            index += 1;
        }
    }
};

export default addStyling;
