import gulp from 'gulp';
import copy from 'gulp-copy';
import sourcemaps from 'gulp-sourcemaps';
import gutil from 'gulp-util';
import minify from 'gulp-babel-minify';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import filter from 'gulp-filter';
import autoprefixer from 'gulp-autoprefixer';
import buffer from 'vinyl-buffer';
import source from 'vinyl-source-stream';
import browserify from 'browserify';
import babelify from 'babelify';


gulp.task('build_js_min', () => {
    const opts = {
        debug: true,
        standalone: 'vmv',
    };
    const b = browserify(opts);
    b.add('./src/index.js');
    b.transform(babelify.configure({
        compact: true,
    }));

    return b.bundle()
        .on('error', e => gutil.log(gutil.colors.red(e.message)))
        .pipe(source('vmv.min.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: false,
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'))
        .pipe(filter('**/*.js'))
        .pipe(minify({
            mangle: {
                keepClassName: true,
            },
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('build_js', () => {
    const opts = {
        debug: true,
        standalone: 'vmv',
    };
    const b = browserify(opts);
    b.add('./src/index.js');
    b.transform(babelify.configure({
        compact: true,
    }));

    return b.bundle()
        .on('error', e => gutil.log(gutil.colors.red(e.message)))
        .pipe(source('vmv.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: false,
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'))
        .pipe(filter('**/*.js'))
        .pipe(gulp.dest('./build'));
});


gulp.task('build_css', () => gulp.src('./src/styles/main.sass')
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(concat('vmv.css'))
    .pipe(gulp.dest('./build')));


gulp.task('copy', () => gulp.src('./build/*')
    // .pipe(copy('./examples'))
    .pipe(gulp.dest('./examples'))
    // .pipe(copy('./docs/assets'))
    .pipe(gulp.dest('./docs/assets')));


gulp.task('build', gulp.series(
    'build_css',
    'build_js',
    'build_js_min',
    'copy',
));

gulp.task('build_fast', gulp.series(
    'build_css',
    'build_js',
    'copy',
));
