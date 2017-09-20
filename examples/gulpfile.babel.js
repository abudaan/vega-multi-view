import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import rename from 'gulp-rename';
import minify from 'gulp-babel-minify';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import filter from 'gulp-filter';
import autoprefixer from 'gulp-autoprefixer';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';
import es from 'event-stream';
import glob from 'glob';
import path from 'path';

const sources = {
    js: './src/js/**/*.js',
    main_js: './src/js/index.js',
};

const targets = {
    // js: './public/js/app2.js',
    js: './public/js/',
};

const logBrowserifyError = e => gutil.log(gutil.colors.red(e.message));

const rebundle = (b, target) => b.bundle()
    .on('error', logBrowserifyError)
    .pipe(source('app.bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest(target));


gulp.task('build_all', (done) => {
    glob('./[0-9]{1,}/app.js', (err, files) => {
        if (err) {
            done(err);
        }
        const tasks = files.map((file) => {
            gutil.log(gutil.colors.blue('building', file));
            const b = browserify({ entries: file, debug: true });
            b.transform(babelify.configure({
                compact: true,
            }));

            return b.bundle()
                .pipe(source(file))
                .pipe(rename({
                    extname: '.bundle.js',
                }))
                // .pipe(minify({
                //     mangle: {
                //         keepClassName: true,
                //     },
                // }))
                .pipe(gulp.dest('./'));
        });
        es.merge(tasks).on('end', done);
    });
});


gulp.task('watch_all', (done) => {
    const w = process.argv[4] || '**';
    glob(`./${w}/app.js`, (err, files) => {
        if (err) {
            done(err);
        }
        const tasks = files.map((file) => {
            gutil.log(gutil.colors.blue('watching', file));
            const b = watchify(browserify({ entries: file, debug: true }));
            const dir = path.dirname(file);
            b.transform(babelify.configure({
                compact: true,
            }));
            b.on('update', () => {
                gutil.log(gutil.colors.blue('update js bundle', file));
                rebundle(b, dir);
            });
            return rebundle(b, dir);
        });
        es.merge(tasks).on('end', done);
    });
});


gulp.task('build_js', () => {
    const folder = process.argv[4] || null;
    if (folder === null) {
        gutil.log(gutil.colors.red('Please provide a folder name.'));
        return false;
    }
    const opts = {
        debug: true,
    };
    const b = browserify(opts);
    b.add(`./examples/${folder}/app.js`);
    b.transform(babelify.configure({
        compact: true,
    }));

    return b.bundle()
        .on('error', logBrowserifyError)
        .pipe(source('app.bundle.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: false,
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(`./examples/${folder}`))
        .pipe(filter('**/*.js'))
        .pipe(minify({
            mangle: {
                keepClassName: true,
            },
        }))
        .pipe(gulp.dest(`./examples/${folder}`));
});
