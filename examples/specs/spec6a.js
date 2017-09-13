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
            name: 'detailDomain',
        },
    ];


    const scales = [
        {
            name: 'xDetail',
            type: 'time',
            range: [0, { signal: 'width' }],
            domain: { data: 'sp500', field: 'date' },
            domainRaw: { signal: 'detailDomain' },
        },
        {
            name: 'yDetail',
            type: 'linear',
            range: [500, 0],
            domain: { data: 'sp500', field: 'price' },
            nice: true,
            zero: true,
        },
    ];


    const axes = [
        {
            orient: 'bottom',
            scale: 'xDetail',
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
        {
            orient: 'left',
            scale: 'yDetail',
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


    const marks = [
        {
            type: 'group',
            clip: { value: true },
            marks: [
                {
                    type: 'area',
                    from: { data: 'sp500' },
                    encode: {
                        update: {
                            x: { scale: 'xDetail', field: 'date' },
                            y: { scale: 'yDetail', field: 'price' },
                            y2: { scale: 'yDetail', value: 0 },
                            fill: { value: 'coral' },
                            fillOpacity: { value: 1 },
                        },
                    },
                },
            ],
        },
    ];


    return {
        $schema: 'https://vega.github.io/schema/vega/v3.0.json',
        width: 720,
        height: 500,
        padding: 30,
        autosize: 'none',
        scales,
        signals,
        axes,
        data,
        marks,
        projections: [],
    };
};
