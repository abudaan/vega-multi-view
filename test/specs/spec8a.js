export default (paths) => {
    const {
        dataPath,
        imagePath,
    } = paths;

    const startDate = new Date(2014, 0, 1, 1);
    const endDate = new Date(2015, 5, 30, 1);
    // console.log('start:', startDate, 'end:', endDate);

    const signals = [
        {
            name: 'detailDomain',
            value: [startDate, endDate],
        },
        {
            name: 'start_date',
            update: 'toDate(detailDomain[0])',
        },
        {
            name: 'end_date',
            update: 'toDate(detailDomain[1])',
        },
    ];

    const data = [
        {
            name: 'reports',
            url: `${dataPath}combined.csv`,
            format: {
                type: 'dsv',
                delimiter: ';',
                parse: {
                    dumps: 'number',
                    fillperc: 'number',
                    reports: 'number',
                    // date: 'date'
                },
            },
            transform: [
                {
                    type: 'formula',
                    as: 'date2',
                    expr: 'toDate(datum.date)',
                },
                {
                    type: 'filter',
                    // expr: 'datum.date2 > datetime(2014, 0, 1) && datum.date2 < datetime(2015, 0, 4)',
                    // expr: '!isNaN(start_date) ? datum.date2 >= start_date && datum.date2 <= end_date : datum.date2 > 0',
                    expr: 'datum.date2 >= start_date && datum.date2 <= end_date',
                },
                {
                    type: 'aggregate',
                    fields: ['reports', 'dumps', 'fillperc'],
                    ops: ['sum', 'sum', 'average'],
                    as: ['reports', 'dumps', 'fillperc'],
                    groupby: ['name', 'bu_code'],
                },
                {
                    type: 'impute',
                    key: 'name',
                    field: 'fillperc',
                    method: 'value',
                    value: 0,
                },
            ],
        },
    ];

    const marks = [
        {
            name: 'marks',
            type: 'symbol',
            from: { data: 'reports' },
            encode: {
                update: {
                    x: { scale: 'x', field: 'fillperc' },
                    y: { scale: 'y', field: 'dumps' },
                    size: { scale: 'size', field: 'reports' },
                    shape: { value: 'circle' },
                    strokeWidth: { value: 2 },
                    // opacity: { value: 0.5 },
                    stroke: { scale: 'color', field: 'name' },
                    fill: { scale: 'color', field: 'name' },
                    // fill: { value: 'transparent' },
                },
                enter: {
                    tooltip: {
                        field: 'name',
                    },
                },
                hover: {
                    tooltip: {
                        field: 'name',
                    },
                },
            },
        },
    ];


    const projections = [
    ];

    const scales = [
        {
            name: 'x',
            type: 'linear',
            // round: true,
            // nice: true,
            // zero: true,
            // domain: { data: 'reports', field: 'reports' },
            domain: [0, 100],
            range: 'width',
        },
        {
            name: 'y',
            type: 'linear',
            // round: true,
            // nice: true,
            // zero: true,
            domain: { data: 'reports', field: 'dumps' },
            range: 'height',
        },
        {
            name: 'size',
            type: 'linear',
            // round: true,
            // nice: false,
            // zero: true,
            domain: { data: 'reports', field: 'reports' },
            range: [1, 1000],
        },
        {
            name: 'color',
            type: 'ordinal',
            range: { scheme: 'tableau20' },
            domain: { data: 'reports', field: 'name' },
        },
    ];


    const axes = [
        {
            scale: 'x',
            grid: false,
            domain: true,
            orient: 'bottom',
            tickCount: 5,
            title: 'reports',
        },
        {
            scale: 'y',
            grid: false,
            domain: true,
            orient: 'left',
            titlePadding: 5,
            title: 'fillperc',
        },
    ];

    const config = {
        axis: {
            domainColor: 'white',
            gridColor: 'white',
            labelColor: 'white',
            tickColor: 'white',
        },
    };

    return {
        $schema: 'https://vega.github.io/schema/vega/v3.0.json',
        description: 'scatterplot',
        width: 900,
        height: 600,
        padding: { left: 40, top: 20, right: 20, bottom: 20 },
        autosize: 'none',
        config,
        axes,
        scales,
        signals,
        data,
        marks,
        projections,
    };
};
