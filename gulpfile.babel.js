import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import babili from 'gulp-babili';
import rollup from 'gulp-rollup';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
// import connect from 'gulp-connect';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import babel from 'rollup-plugin-babel';
// import envify from 'envify';
// import uglifyify from 'uglifyify';
// import collapse from 'bundle-collapser';
// import del from 'del';
import path from 'path';


const sources = {
    js: './src/js/**/*.js',
    main_js: './src/js/index.js',
};

const targets = {
    js: './build',
};

const logBrowserifyError = (e) => {
    gutil.log(gutil.colors.red(e.message));
    // if(e.codeFrame){
    //   if(_.startsWith(e.codeFrame, 'false')){
    //     console.log(e.codeFrame.substr(5))
    //   }else{
    //     console.log(e.codeFrame)
    //   }
    // }
};

const rebundle = b => b.bundle()
    .on('error', logBrowserifyError)
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(gulp.dest(path.join(targets.js)))
    .pipe(rename((t) => {
        t.basename = 'app';
    }))
    .pipe(gulp.dest(targets.js));
// .pipe(reload());

gulp.task('watch_js', () => {
    const opts = {
        debug: true,
        paths: sources.js,
    };

    opts.cache = {};
    opts.packageCache = {};

    const b = watchify(browserify(opts));
    b.add(sources.main_js);
    b.transform(babelify.configure({
        compact: false,
        presets: [
            [
                'env',
                {
                    targets: {
                        browsers: [
                            'last 2 Chrome versions',
                        ],
                        node: 'current',
                    },
                },
            ],
        ],
    }));

    b.on('update', () => {
        gutil.log('update js bundle');
        rebundle(b);
    });

    return rebundle(b);
});

gulp.task('build_js2', () => {
    gulp.src(sources.js)
        .pipe(sourcemaps.init())
        .pipe(rollup({
            allowRealFiles: true, // !IMPORTANT, it avoids the hypothetical file system error
            entry: sources.main_js,
            plugins: [
                babel({
                    exclude: 'node_modules/**',
                    presets: [['es2015', { loose: true, modules: false }], 'stage-0'],
                    // plugins: [
                    //     'transform-flow-strip-types',
                    // ],
                    // presets: [
                    //     [
                    //         'env',
                    //         {
                    //             targets: {
                    //                 browsers: [
                    //                     'last 2 Chrome versions',
                    //                 ],
                    //                 node: 'current',
                    //             },
                    //         },
                    //     ],
                    //     {
                    //         modules: false,
                    //     },
                    // ],
                    // babelrc: false,
                    // format: 'cjs',
                }),
            ],
            moduleName: 'testing',
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(targets.js));
});

gulp.task('build_js', () => {
    const opts = {
        debug: true,
        path: sources.js,
    };
    const b = browserify(opts);
    b.add(sources.main_js);
    b.transform(babelify.configure({
        compact: true,
        presets: [
            [
                'env',
                {
                    targets: {
                        browsers: [
                            'last 2 Chrome versions',
                        ],
                        node: 'current',
                    },
                },
            ],
        ],
    }));
    // b.transform(envify({ NODE_ENV: 'development' }));
    // b.transform('uglifyify', { global: true });

    return b.bundle()
        .on('error', logBrowserifyError)
        .pipe(source('index.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true,
        }))
        // .pipe(sourcemaps.write(path.join(targets.dist, 'js')))
        // .pipe(gulp.dest(targets.js))
        // .pipe(babili({
        //     mangle: {
        //         keepClassName: true,
        //     },
        // }))
        .pipe(rename((t) => {
            t.basename = 'app';
        }))
        .pipe(gulp.dest(targets.js));
});
