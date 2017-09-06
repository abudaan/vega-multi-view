export default (paths) => {
    const {
        dataPath,
        imagePath,
    } = paths;
    const signals = [
        {
            name: 'date_start',
            value: 0,
            // update: 'invert(\'date_scale\', event.target.valueAsNumber)',
            bind: {
                input: 'range',
                min: 0,
                max: 100,
            },
        },
        {
            name: 'date_end',
            value: 10,
            // update: 'invert(\'date_scale\', event.target.valueAsNumber)',
            bind: {
                input: 'range',
                min: 0,
                max: 100,
                label: 'date_end',
            },
        },
        {
            name: 'selected_date_range',
            update: '[invert("date_scale", date_start), invert("date_scale", date_end)]',
        },
        // {
        //     name: 'indexDate',
        //     description: 'A date value that updates in response to mousemove.',
        //     // update: 'datetime(2005, 0, 1)',
        //     on: [{ events: 'mousemove', update: "invert('date_scale', x())" }],
        //     // on: [{ events: 'mousemove', update: "scale('xscale', x())" }],
        //     // on: [{ events: 'mousemove', update: 'x()' }],
        // },
    ];


    const data = [
        {
            name: 'reports',
            values: [
                {
                    datetime: new Date(2014, 11, 31).getTime(),
                    // datetime: 1000,
                },
                {
                    datetime: new Date(2014, 8, 1).getTime(),
                    // datetime: 10,
                },
                {
                    datetime: new Date(2014, 6, 1).getTime(),
                    // datetime: 10000,
                },
                {
                    datetime: new Date(2014, 1, 1).getTime(),
                    // datetime: 300,
                },
            ],
        },
    ];

    const marks = [
        {
            type: 'text',
            encode: {
                enter: {
                    align: {
                        value: 'left',
                    },
                    fontSize: {
                        value: 20,
                    },
                    width: {
                        value: 50,
                    },
                    baseline: {
                        value: 'bottom',
                    },
                    fill: {
                        value: '#fff',
                    },
                    x: {
                        value: 100,
                    },
                    y: {
                        value: 100,
                    },
                },
                update: {
                    text: {
                        signal: 'selected_date_range',
                    },
                },
            },
        },
    ];


    const projections = [

    ];

    const scales = [
        {
            name: 'date_scale',
            type: 'time',
            domain: {
                data: 'reports',
                field: 'datetime',
            },
            // domainMin: 10,
            // domainMax: 10000,
            // domain: [new Date(2014, 0, 1).getTime(), new Date(2014, 11, 1).getTime()],
            // domain: ['date_start', 'date_end'],
            range: [0, 100],
        },
        {
            name: 'xscale',
            type: 'time',
            // domain: ['date_start', 'date_end'],
            // domainMin: '2013-01-01',
            // domainMax: '2014-01-01',
        },
    ];


    return {
        $schema: 'https://vega.github.io/schema/vega/v3.0.json',
        width: 900,
        height: 600,
        autosize: 'none',
        scales,
        signals,
        data,
        marks,
        projections,
    };
};
