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

gulp.task('jsTypograf', function() {
    return gulp.src('./node_modules/typograf/dist/typograf.all.js')
        .pipe(concat('typograf.min.js'))
        .pipe(uglify({
            /*jshint camelcase: false */
            output: {ascii_only: true},
            /*jshint camelcase: true */
            preserveComments: 'some'
        }))
        .pipe(gulp.dest(destDir));
});

gulp.task('jsJquery', function() {
    return gulp.src('./node_modules/jquery/dist/jquery.min.js')
        .pipe(gulp.dest(destDir));
});

gulp.task('jsDiff', function() {
    return gulp.src('./node_modules/diff/dist/diff.min.js')
        .pipe(gulp.dest(destDir));
});

gulp.task('jsApp', function() {
    return browserify('./src/js/app.js')
        .bundle()
        .pipe(source('app.min.js'))
        .pipe(streamify(uglify({
            /*jshint camelcase: false */
            output: {ascii_only: true},
            /*jshint camelcase: true */
            preserveComments: 'some'
        })))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssMobile', function() {
    return gulp.src('./src/less/mobile.less')
        .pipe(concat('mobile.min.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssDesktop', function() {
    return gulp.src('./src/less/desktop.less')
        .pipe(concat('desktop.min.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('copyTemplates', function() {
    return gulp.src('./src/html/*.html').pipe(gulp.dest('./'));
});

gulp.task(
    'updateVersion',
    [
        'jsApp',
        'jsTypograf',
        'jsJquery',
        'jsDiff',
        'cssMobile',
        'cssDesktop',
        'copyTemplates'
    ],
    function() {
        return gulp.src('./build/*.*').pipe(md5(10, './*.html'));
    }
);

gulp.task('watch', function() {
    gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['updateVersion']);
