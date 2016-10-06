const gulp = require('gulp');
const less = require('gulp-less');
const concat = require('gulp-concat');
const cleancss = require('gulp-cleancss');
const autoprefixer = require('gulp-autoprefixer');
const streamify = require('gulp-streamify');
const browserify = require('browserify');
const uglify = require('gulp-uglify');
const source = require('vinyl-source-stream');
const replace = require('gulp-replace');

const destDir = './build/';
const apBrowsers = {
    browsers: ['ie >= 9', 'Firefox >= 24', 'Chrome >= 26', 'iOS >= 5', 'Safari >= 6', 'Android > 2.3']
};
const paths = {
    html: [
        'index.html',
        'mobile.html'
    ],
    jsTypograf: [
        'node_modules/typograf/dist/typograf.all.js'
    ],
    cssDesktop: [
        'src/less/common.less',
        'src/less/desktop.less'
    ],
    cssMobile: [
        'src/less/common.less',
        'src/less/mobile.less'
    ]
};

gulp.task('jsTypograf', function() {
    return gulp.src(paths.jsTypograf)
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
        /*jshint camelcase: false */
        .pipe(streamify(uglify({
            output: {ascii_only: true},
            preserveComments: 'some'
        })))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssMobile', function() {
    return gulp.src(paths.cssMobile)
        .pipe(concat('mobile.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssDesktop', function() {
    return gulp.src(paths.cssDesktop)
        .pipe(concat('desktop.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('updateVersion', function() {
    return gulp.src(paths.html)
        .pipe(replace(/\?v=\d+/g, '?v=' + (+new Date())))
        .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
    gulp.watch('src/js/**/*', ['default']);
    gulp.watch('src/less/**/*', ['default']);
});

gulp.task('default', ['updateVersion', 'jsApp', 'jsTypograf', 'cssMobile', 'cssDesktop']);
