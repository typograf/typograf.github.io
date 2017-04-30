const autoprefixer = require('gulp-autoprefixer');
const browserify = require('browserify');
const concat = require('gulp-concat');
const cleancss = require('gulp-cleancss');
const gulp = require('gulp');
const less = require('gulp-less');
const md5 = require('gulp-md5-assets');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const uglify = require('gulp-uglify');

const destDir = './build/';
const apBrowsers = {
    browsers: ['ie >= 9', 'Firefox >= 24', 'Chrome >= 26', 'iOS >= 5', 'Safari >= 6', 'Android > 2.3']
};

const cssCommon = [
    'node_modules/show-js-error/dist/show-js-error.css',
    'node_modules/typograf/dist/typograf.css',
    'src/less/common.less'
];

gulp.task('jsTypograf', function() {
    return gulp.src('node_modules/typograf/dist/typograf.all.js')
        .pipe(concat('typograf.js'))
        .pipe(uglify({
            /*jshint camelcase: false */
            output: {ascii_only: true},
            /*jshint camelcase: true */
            preserveComments: 'some'
        }))
        .pipe(gulp.dest(destDir));
});

gulp.task('jsApp', ['jsTypograf'], function() {
    return browserify('./src/js/app.js')
        .bundle()
        .pipe(source('app.js'))
        .pipe(streamify(uglify({
            /*jshint camelcase: false */
            output: {ascii_only: true},
            /*jshint camelcase: true */
            preserveComments: 'some'
        })))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssMobile', function() {
    return gulp.src(['src/less/mobile.less'].concat(cssCommon))
        .pipe(concat('mobile.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssDesktop', function() {
    return gulp.src(['src/less/desktop.less'].concat(cssCommon))
        .pipe(concat('desktop.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('copyTemplates', function() {
    return gulp.src('./src/html/*.html').pipe(gulp.dest('./'));
});

gulp.task('updateVersion', ['jsApp', 'jsTypograf', 'cssMobile', 'cssDesktop', 'copyTemplates'], function() {
    return gulp.src('./build/*.*').pipe(md5(10, './*.html'));
});

gulp.task('watch', function() {
    gulp.watch('src/js/**/*', ['default']);
    gulp.watch('src/less/**/*', ['default']);
});

gulp.task('default', ['updateVersion']);
