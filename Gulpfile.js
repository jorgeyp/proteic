'use strict';

const gulp = require('gulp');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const server = require('karma').Server;
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const jshint = require('gulp-jshint');
const protractor = require("gulp-protractor").protractor;
const webdriver_update = require('gulp-protractor').webdriver_update;
const webdriver_standalone = require('gulp-protractor').webdriver_standalone;
const webserver = require('gulp-webserver');

const libname = 'proteus-charts';

gulp.task('syntax', () => {
  return gulp.src('src/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('babel', () => {
  return gulp.src('src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('lib/'));
});

gulp.task('concat', ['babel'], () => {
  return gulp.src([
    './lib/utils/functions.js',
    './lib/utils/image.js',
    './lib/utils/strategies.js',
    './lib/utils/colors.js',
    './lib/utils/globals.js',
    './lib/svg/SvgStrategy.js',
    './lib/svg/svg.js',
    './lib/svg/strategy_barchart.js',
    './lib/svg/strategy_linechart.js',
    './lib/svg/strategy_streamgraph.js',
    './lib/charts/classes.js',
    './lib/charts/barchart.js',
    './lib/charts/linechart.js',
    './lib/charts/streamgraph.js'

  ])
    .pipe(concat(libname + '.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('vendor', () => {
  return gulp.src([
    './node_modules/d3/d3.min.js'

  ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['concat'], () => {
  return gulp.src('dist/' + libname + '.js')
    .pipe(uglify())
    .pipe(rename(libname + '.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test:unit', (done) => {
  new server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

// Start the standalone selenium server
// NOTE: This is not needed if you reference the
// seleniumServerJar in your protractor.conf.js
gulp.task('webdriver_standalone', webdriver_standalone);

// Protractor test runner task
gulp.task('test:e2e', ['webdriver_update', 'webserver'], (cb) => {
  gulp.src([])
    .pipe(protractor({
      configFile: 'protractor.conf.js'
    }))
    .on('end', () => {
      console.log('E2E Testing complete');
      process.exit(0);
    })
    .on('error', (err) => {
      console.error('E2E Tests failed:');
      console.error(err);
      process.exit(0); //todo: change this
    });
});

gulp.task('webserver', function() {
  return gulp.src('')
    .pipe(webserver({
      livereload: false,
      directoryListing: true,
      open: true,
      port: 9000
    }));
});

gulp.task('test', ['test:unit', 'test:e2e']);
gulp.task('build', ['test', 'syntax', 'vendor', 'minify']);
gulp.task('default', ['test', 'build']);
