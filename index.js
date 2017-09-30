import { version } from './package.json';

export {
    addViews,
    removeViews,
    showSpecInTab,
} from './src/js/index';

const v = `vega-multi-view ${version}`;
export {
    v as version,
};
