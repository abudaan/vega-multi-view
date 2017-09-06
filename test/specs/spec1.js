export default (paths) => {
    const {
        dataPath,
        imagePath,
    } = paths;

    const signals = [
        {
            name: 'buurt_hover',
            value: null,
            on: [
                {
                    events: '@buurt:mouseover',
                    update: 'datum',
                },
                {
                    events: '@buurt:mouseout',
                    update: 'null',
                },
            ],
        },
        {
            name: 'mouse_xy',
            on: [
                {
                    events: 'mousemove',
                    update: 'xy()',
                },
            ],
        },
        {
            name: 'tooltip_mouse_xy',
            on: [
                {
                    events: '@buurt:mouseover',
                    update: 'xy()',
                },
            ],
        },
        {
            name: 'date_start',
            value: 3,
            bind: {
                input: 'range',
                min: 0,
                max: 100,
            },
        },
        {
            name: 'date_end',
            value: 4,
            bind: {
                input: 'range',
                min: 0,
                max: 100,
            },
        },
        {
            name: 'selected_date_range',
            update: '[date_start, date_end]',
        },
        {
            name: 'zoom',
            value: 13,
        },
        {
            name: 'latitude',
            value: 51.9309303,
        },
        {
            name: 'longitude',
            value: 4.3491274,
        },
    ];


    const data = [
        {
            name: 'reports',
            // url: `${dataPath}reports.csv?${Date.now()}`,
            url: `${dataPath}reports.csv`,
            format: {
                type: 'dsv',
                delimiter: ';',
            },
            transform: [
                // {
                //     type: 'geopoint',
                //     projection: 'projection',
                //     fields: [
                //         'x',
                //         'y',
                //     ],
                //     as: [
                //         'x2',
                //         'y2',
                //     ],
                // },
                {
                    type: 'formula',
                    as: 'datetime',
                    expr: 'datetime(datum.date)',
                },
                // {
                //     'type': 'filter',
                //     'expr': 'datum.datetime > selected_date_range[0] && datum.datetime < selected_date_range[1]'
                // }
            ],
        },
        {
            name: 'data',
            url: `${dataPath}data.json`,
            format: {
                type: 'json',
            },
        },
        {
            name: 'buurten',
            url: `${dataPath}buurten.topo.json`,
            format: {
                type: 'topojson',
                feature: 'Gebieden',
            },
            transform: [
                {
                    type: 'geopath',
                    projection: 'projection',
                },
                {
                    type: 'lookup',
                    from: 'data',
                    key: 'name',
                    fields: [
                        'properties.NAAM',
                    ],
                    values: [
                        'vulling',
                        'meldingen',
                        'stortingen',
                    ],
                },
            ],
        },
        {
            name: 'buurten2',
            source: 'buurten',
            transform: [
                {
                    type: 'lookup',
                    from: 'data',
                    key: 'name',
                    fields: [
                        'properties.NAAM',
                    ],
                    values: [
                        'vulling',
                        'meldingen',
                        'stortingen',
                    ],
                },
                {
                    type: 'filter',
                    expr: 'datum.vulling != null',
                },
            ],
        },
    ];

    const marks = [
        {
            type: 'path',
            name: 'buurt',
            from: {
                data: 'buurten',
            },
            encode: {
                enter: {
                    fillOpacity: {
                        value: 0.3,
                    },
                    strokeWidth: {
                        value: 1,
                    },
                    stroke: {
                        value: '#ee0000',
                    },
                    fill: {
                        value: '#00ee00',
                    },
                },
                update: {
                    path: {
                        field: 'path',
                    },
                },
            },
        },
        {
            type: 'text',
            name: 'buurt-info',
            encode: {
                enter: {
                    font: {
                        value: 'Butcherman Caps',
                    },
                    align: {
                        value: 'left',
                    },
                    fontSize: {
                        value: 12,
                    },
                    width: {
                        value: 50,
                    },
                    baseline: {
                        value: 'bottom',
                    },
                    fill: {
                        value: '#333',
                    },
                },
                update: {
                    text: {
                        signal: 'mouse_xy',
                    },
                    x: {
                        signal: 'mouse_xy[0]',
                    },
                    y: {
                        signal: 'mouse_xy[1]',
                    },
                },
            },
        },
        {
            type: 'image',
            name: 'report_image',
            from: {
                data: 'reports',
            },
            encode: {
                enter: {
                    url: {
                        value: `${imagePath}afval.png`,
                    },
                    x: {
                        field: 'x2',
                    },
                    y: {
                        field: 'y2',
                    },
                },
                update: {
                    x: {
                        field: 'x2',
                    },
                    y: {
                        field: 'y2',
                    },
                },
            },
            transform: [
                {
                    type: 'geopoint',
                    projection: 'projection',
                    fields: [
                        'x',
                        'y',
                    ],
                    as: [
                        'x2',
                        'y2',
                    ],
                },
            ],
        },
        {
            type: 'text',
            name: 'report_text',
            from: {
                data: 'reports',
            },
            encode: {
                enter: {
                    text: {
                        value: 'x',
                    },
                    x: {
                        field: 'x2',
                    },
                    y: {
                        field: 'y2',
                    },
                },
                update: {
                    x: {
                        field: 'x2',
                    },
                    y: {
                        field: 'y2',
                    },
                },
            },
        },
    ];


    const projections = [
        {
            name: 'projection',
            type: 'mercator',
            scale: {
                signal: '256*pow(2,zoom)/2/PI',
            },
            rotate: [
                {
                    signal: '-longitude',
                },
                0,
                0,
            ],
            center: [
                0,
                {
                    signal: 'latitude',
                },
            ],
            translate: [
                {
                    signal: 'width/2',
                },
                {
                    signal: 'height/2',
                },
            ],
        },
    ];

    const scales = [
        {
            name: 'date_scale',
            type: 'time',
            domain: {
                data: 'reports',
                field: 'datetime',
            },
            range: [0, 100],
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
