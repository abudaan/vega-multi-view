export default (paths) => {
    const {
        dataPath,
        imagePath,
    } = paths;

    const signals = [
        {
            name: 'mouse_xy',
            on: [
                {
                    events: {
                        type: 'mousemove',
                        target: 'window',
                        throttle: 10,
                    },
                    update: 'xy()',
                },
            ],
        },
        {
            name: 'update_css',
            value: 1,
            on: [
                {
                    events: '@update_css_text:click',
                    update: 'update_css == 1 ? 0 : 1',
                },
            ],
        },
    ];


    const data = [

    ];

    const marks = [
        {
            type: 'text',
            name: 'update_css_text',
            encode: {
                enter: {
                    align: {
                        value: 'left',
                    },
                    fill: {
                        value: 'white',
                    },
                    fontSize: {
                        value: 13,
                    },
                    x: {
                        signal: '(width/2) - 100',
                    },
                    y: {
                        signal: 'height/2',
                    },
                    text: {
                        value: '[click here to update font]',
                    },
                },
            },
        },
        {
            type: 'text',
            name: 'text-webfont',
            encode: {
                enter: {
                    align: {
                        value: 'left',
                    },
                    fill: {
                        value: 'white',
                    },
                    font: {
                        value: 'sans-serif',
                    },
                    fontSize: {
                        value: 18,
                    },
                },
                update: {
                    text: {
                        value: 'Vega using webfont',
                    },
                    x: {
                        signal: 'mouse_xy[0] + 10',
                    },
                    y: {
                        signal: 'mouse_xy[1] + 10',
                    },
                    fill: {
                        signal: 'update_css == 0 ? "red" : "white"',
                    },
                    font: {
                        signal: 'update_css == 0 ? "Butcherman Caps" : "sans-serif"',
                    },
                    fontSize: {
                        signal: 'update_css == 0 ? 40 : 18',
                    },
                    // x: {
                    //     value: 100,
                    // },
                    // y: {
                    //     value: 100,
                    // },
                },
            },
        },
    ];


    const projections = [

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
