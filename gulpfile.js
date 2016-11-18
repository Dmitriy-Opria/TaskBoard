/**
 * Created by alexey-dev on 07.11.16.
 */
var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    less = require('gulp-less'),
    cleanCSS = require('gulp-clean-css');

gulp.task('build-js', function () {
    return gulp.src(['./bower_components/jquery/dist/jquery.min.js',
        './bower_components/bootstrap/dist/js/bootstrap.min.js',
        './bower_components/bootstrap/js/collapse.js',
        './bower_components/bootstrap/js/transition.js',
        './public/jquery-ui-1.12.1/jquery-ui.min.js',
        './bower_components/alertify-js/build/alertify.min.js',
        './bower_components/shave/dist/shave.min.js',
        './public/javascripts/site.js'])
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('./public/javascripts'));
});
gulp.task('build-css', function () {
    return gulp.src(['./bower_components/bootstrap/dist/css/bootstrap.css',
        './bower_components/bootstrap/dist/css/bootstrap-theme.min.css',
        './bower_components/alertify-js/build/css/alertify.min.css',
        './bower_components/alertify-js/build/css/themes/default.css'])
        .pipe(less())
        .pipe(cleanCSS())
        .pipe(concat('app.css'))
        .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('build-assets', ['build-js', 'build-css']);