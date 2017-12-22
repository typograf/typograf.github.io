'use strict';

const
    gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    babel = require('rollup-plugin-babel'),
    resolve = require('rollup-plugin-node-resolve'),
    commonjs = require('rollup-plugin-commonjs'),
    destDir = './build/',
    apBrowsers = {browsers: [
        'ie >= 9', 'Firefox >= 24', 'Chrome >= 26',
        'iOS >= 5', 'Safari >= 6', 'Android > 4.0'
    ]},
    uglifyOptions = { output: { ascii_only: true, comments: 'some' } };

gulp.task('jsTypograf', function() {
    return gulp.src('./node_modules/typograf/dist/typograf.all.min.js')
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
    return gulp.src('./src/js/app.js')
        .pipe($.rollup({
            allowRealFiles: true,
            input: './src/js/app.js',
            format: 'iife',
            plugins: [
                resolve(),
                commonjs(),
                babel()
            ]
        }))
        .pipe($.rename('app.min.js'))
        .pipe($.uglify(uglifyOptions))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssMobile', function() {
    return gulp.src('./src/less/mobile.less')
        .pipe($.concat('mobile.min.css'))
        .pipe($.less())
        .pipe($.cleancss())
        .pipe($.autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('cssDesktop', function() {
    return gulp.src('./src/less/desktop.less')
        .pipe($.concat('desktop.min.css'))
        .pipe($.less())
        .pipe($.cleancss())
        .pipe($.autoprefixer(apBrowsers))
        .pipe(gulp.dest(destDir));
});

gulp.task('copyTemplates', function() {
    return gulp.src('./src/html/*.html').pipe(gulp.dest('./'));
});

gulp.task('copySvg', function() {
    return gulp.src('./src/svg/*.svg').pipe(gulp.dest(destDir + '/svg'));
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
        'copySvg',
        'copyTemplates'
    ],
    function() {
        return gulp.src('./build/*.*').pipe($.md5Assets(10, './*.html'));
    }
);

gulp.task('watch', function() {
    gulp.watch('src/**/*', [ 'default' ]);
});

gulp.task('default', [ 'updateVersion' ]);
