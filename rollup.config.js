import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/js/index.js',
    dest: 'build/index.js',
    format: 'cjs',
    plugins: [
        resolve({
            module: true,
            jsnext: true,
            modulesOnly: true,
            browser: true,
        }),
        json(),
        commonjs({
            include: 'node_modules/**',
            namedExports: {
                'node_modules/vega-loader/src/formats/topojson.js': ['feature'],
            },
        }),
        babel({
            exclude: 'node_modules/**', // only transpile our source code
        }),

    ],
};


// export default {
//     entry: 'src/js/main.js',
//     dest: 'build/bundle.js',
//     format: 'cjs',
// };
