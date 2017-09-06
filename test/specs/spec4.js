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
            name: 'buurt_hover_naam',
            update: 'buurt_hover ? buurt_hover.properties.NAAM : null',
        },
        {
            name: 'zoom',
            value: 13,
        },
        {
            name: 'latitude',
            value: 51.927754415373855,

        },
        {
            name: 'longitude',
            value: 4.38680648803711,
        },
    ];


    const data = [
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
            ],
        },
        {
            name: 'containers',
            url: `${dataPath}containers.topo.json`,
            format: {
                type: 'topojson',
                feature: 'containers.geo',
            },
            transform: [
                {
                    type: 'geopoint',
                    projection: 'projection',
                    fields: [
                        'geometry.coordinates[0]',
                        'geometry.coordinates[1]',
                    ],
                    as: [
                        'x',
                        'y',
                    ],
                },
            ],
        },
        {
            name: 'scholen',
            url: `${dataPath}scholen.topo.json`,
            format: {
                type: 'topojson',
                feature: 'scholen.geo',
            },
            transform: [
                {
                    type: 'geopoint',
                    projection: 'projection',
                    fields: [
                        'geometry.coordinates[0]',
                        'geometry.coordinates[1]',
                    ],
                    as: [
                        'x',
                        'y',
                    ],
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
                    fill: {
                        value: '#00ee00',
                    },
                },
                update: {
                    stroke: {
                        value: '#fff',
                    },
                    path: {
                        field: 'path',
                    },
                },
                hover: {
                    // tooltip: {
                    //     signal: 'buurt_hover_naam',
                    // },
                    stroke: {
                        value: '#ee0000',
                    },
                },
            },
        },
        {
            type: 'image',
            name: 'container_image',
            from: {
                data: 'containers',
            },
            encode: {
                enter: {
                    url: {
                        value: `${imagePath}afval.png`,
                    },
                    x: {
                        field: 'x',
                    },
                    y: {
                        field: 'y',
                    },
                },
                update: {
                    x: {
                        field: 'x',
                    },
                    y: {
                        field: 'y',
                    },
                },
            },
        },
        {
            type: 'image',
            name: 'scholen_image',
            from: {
                data: 'scholen',
            },
            encode: {
                enter: {
                    url: {
                        value: `${imagePath}school.png`,
                    },
                    x: {
                        field: 'x',
                    },
                    y: {
                        field: 'y',
                    },
                },
                update: {
                    x: {
                        field: 'x',
                    },
                    y: {
                        field: 'y',
                    },
                },
            },
        },
        {
            type: 'text',
            encode: {
                enter: {
                    align: {
                        value: 'left',
                    },
                    fontSize: {
                        value: 15,
                    },
                    x: {
                        value: 60,
                    },
                    y: {
                        value: 30,
                    },
                    fill: {
                        value: 'white',
                    },
                },
                update: {
                    text: {
                        signal: 'buurt_hover_naam',
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
    ];


    return {
        $schema: 'https://vega.github.io/schema/vega/v3.0.json',
        width: 720,
        height: 720,
        autosize: 'none',
        scales,
        signals,
        data,
        marks,
        projections,
    };
};
