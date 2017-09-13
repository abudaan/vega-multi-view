export default (paths) => {
    const {
        dataPath,
        imagePath,
    } = paths;


    const data = [
        {
            name: 'sp500',
            url: `${dataPath}/sp500.csv`,
            format: { type: 'csv', parse: { price: 'number', date: 'date' } },
        },
    ];


    const signals = [
        {
            name: 'brush',
            value: 0,
            on: [
                {
                    events: 'mousedown',
                    update: '[x(), x()]',
                },
                {
                    events: '[mousedown, window:mouseup] > window:mousemove!',
                    update: '[brush[0], clamp(x(), 0, width)]',
                },
                {
                    events: { signal: 'delta' },
                    update: 'clampRange([anchor[0] + delta, anchor[1] + delta], 0, width)',
                },
            ],
        },
        {
            name: 'anchor',
            value: null,
            on: [{ events: '@brush:mousedown', update: 'slice(brush)' }],
        },
        {
            name: 'xdown',
            value: 0,
            on: [{ events: '@brush:mousedown', update: 'x()' }],
        },
        {
            name: 'delta',
            value: 0,
            on: [
                {
                    events: '[@brush:mousedown, window:mouseup] > window:mousemove!',
                    update: 'x() - xdown',
                },
            ],
        },
        {
            name: 'detailDomain',
            on: [
                {
                    events: { signal: 'brush' },
                    update: "span(brush) ? invert('xOverview', brush) : null",
                },
            ],
        },

    ];


    const axes = [
        {
            orient: 'bottom',
            scale: 'xOverview',
            encode: {
                ticks: {
                    enter: {
                        stroke: { value: 'white' },
                    },
                },
                domain: {
                    enter: {
                        stroke: { value: 'white' },
                    },
                },
                labels: {
                    enter: {
                        fill: { value: 'white' },
                    },
                },
            },
        },
    ];


    const scales = [
        {
            name: 'xOverview',
            type: 'time',
            range: [0, { signal: 'width' }],
            domain: { data: 'sp500', field: 'date' },
        },
        {
            name: 'yOverview',
            type: 'linear',
            range: [70, 0],
            domain: { data: 'sp500', field: 'price' },
            nice: true,
            zero: true,
        },
    ];


    const projections = [];

    const marks = [
        {
            type: 'area',
            interactive: false,
            from: { data: 'sp500' },
            encode: {
                update: {
                    x: { scale: 'xOverview', field: 'date' },
                    y: { scale: 'yOverview', field: 'price' },
                    y2: { scale: 'yOverview', value: 0 },
                    fill: { value: '#f7b6d2' },
                },
            },
        },
        {
            type: 'rect',
            name: 'brush',
            encode: {
                enter: {
                    y: { value: 0 },
                    height: { value: 70 },
                    fill: { value: '#333' },
                    fillOpacity: { value: 0.2 },
                },
                update: {
                    x: { signal: 'brush[0]' },
                    x2: { signal: 'brush[1]' },
                },
            },
        },
        {
            type: 'rect',
            interactive: false,
            encode: {
                enter: {
                    y: { value: 0 },
                    height: { value: 70 },
                    width: { value: 1 },
                    fill: { value: 'firebrick' },
                },
                update: {
                    x: { signal: 'brush[0]' },
                },
            },
        },
        {
            type: 'rect',
            interactive: false,
            encode: {
                enter: {
                    y: { value: 0 },
                    height: { value: 70 },
                    width: { value: 1 },
                    fill: { value: 'yellow' },
                },
                update: {
                    x: { signal: 'brush[1]' },
                },
            },
        },
    ];

    return {
        $schema: 'https://vega.github.io/schema/vega/v3.0.json',
        width: 720,
        height: 70,
        padding: 30,
        autosize: 'none',
        scales,
        signals,
        axes,
        data,
        marks,
        projections,
    };
};
