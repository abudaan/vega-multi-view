import { vega as vegaTooltip } from 'vega-tooltip';

const addTooltips = (data) => {
    data.forEach((d) => {
        if (d.vmvConfig !== null && typeof d.vmvConfig.tooltipOptions !== 'undefined') {
            vegaTooltip(d.view, d.vmvConfig.tooltipOptions);
        }
    });
};

export default addTooltips;
