var gulp = require('gulp'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    cleancss = require('gulp-cleancss'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    replace = require('gulp-replace'),
    destDir = './build/';

var paths = {
    html: [
        'index.html',
        'mobile.html'
    ],
    jsTypograf: [
        'node_modules/typograf/dist/typograf.js',
        'node_modules/typograf/dist/typograf.titles.js',
        'node_modules/typograf/dist/typograf.groups.js'
    ],
    cssDesktop: [
        'src/css/common.less',
        'src/css/desktop.less'
    ],
    cssMobile: [
        'src/css/common.less',
        'src/css/mobile.less'
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
/*        .pipe(uglify({
            output: {ascii_only: true},
            preserveComments: 'some'
        }))*/
        .pipe(gulp.dest(destDir));
});

gulp.task('cssMobile', function() {
    return gulp.src(paths.cssMobile)
        .pipe(concat('mobile.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(gulp.dest(destDir));
});

gulp.task('cssDesktop', function() {
    return gulp.src(paths.cssDesktop)
        .pipe(concat('desktop.css'))
        .pipe(less())
        .pipe(cleancss())
        .pipe(gulp.dest(destDir));
});

gulp.task('updateVersion', function() {
    return gulp.src(paths.html)
        .pipe(replace(/\?v=\d+/g, '?v=' + (+new Date())))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['updateVersion', 'jsApp', 'jsTypograf', 'cssMobile', 'cssDesktop']);
