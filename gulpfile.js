var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');
var htmlReplace = require('gulp-html-replace');
var htmlMin = require('gulp-htmlmin');
var del = require('del');
var sequence = require('run-sequence');
var axe = require('gulp-axe-webdriver');
var deploy      = require('gulp-gh-pages');


var config = {
  dist: 'docs/',
  src: 'src/',
  cssin: 'src/css/**/*.css',
  jsin: [
    'node_modules/jquery/dist/jquery.js',
    'node_modules/foundation-sites/dist/js/foundation.js',
    'node_modules/focus-visible/dist/focus-visible.min.js',
    'node_modules//ally.js/ally.min.js',
    'node_modules/chrono-node/chrono.min.js',
    'src/js/**/*.js'
    ],
  imgin: 'src/img/**/*.{jpg,jpeg,png,gif}',
  htmlin: 'src/*.html',
  scssin: 'src/scss/**/*.scss',
  cssout: 'dist/css/',
  jsout: 'dist/js/',
  imgout: 'dist/img/',
  htmlout: 'dist/',
  scssout: 'src/css/',
  cssoutname: 'style.css',
  jsoutname: 'script.js',
  cssreplaceout: 'css/style.css',
  jsreplaceout: 'js/script.js'
};

gulp.task('reload', function() {
  browserSync.reload();
});

gulp.task('serve', ['sass'], function() {
  browserSync({
    server: config.dist
  });

  gulp.watch([config.htmlin], function(){
    sequence('html', 'reload', 'axe');
    sequence('html', 'reload', 'axe');

  });
  gulp.watch([config.jsin], function(){
    sequence('js', 'reload', 'axe');
  });
  gulp.watch([config.scssin], function(){
    sequence('sass', 'css', 'reload');
  });
});

gulp.task('sass', function() {
  return gulp.src(config.scssin)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.scssout))
    .pipe(browserSync.stream());
});

gulp.task('css', function() {
  return gulp.src(config.cssin)
    .pipe(concat(config.cssoutname))
    .pipe(cleanCSS())
    .pipe(gulp.dest(config.cssout));
});

gulp.task('js', function() {
  return gulp.src(config.jsin)
    .pipe(concat(config.jsoutname))
    //.pipe(uglify())
    .pipe(gulp.dest(config.jsout));
});
/*
gulp.task('img', function() {
  return gulp.src(config.imgin)
    .pipe(changed(config.imgout))
    .pipe(imagemin())
    .pipe(gulp.dest(config.imgout));
});
*/
gulp.task('img', function() {
    gulp.src(config.imgin)
        .pipe(gulp.dest(config.imgout));
});

gulp.task('html', function() {
  return gulp.src(config.htmlin)
    .pipe(htmlReplace({
      'css': config.cssreplaceout,
      'js': config.jsreplaceout
    }))
    .pipe(htmlMin({
      sortAttributes: true,
      sortClassName: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(config.dist));
});

gulp.task('axe', function() {

  var options = {
    saveOutputIn: '',
    urls: [config.htmlout+'*.html'],
    headless: true
  };
  return axe(options);
});

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
  return gulp.src(config.dist+"**/*")
    .pipe(deploy())
});

gulp.task('clean', function() {
  return del([config.dist]);
});

gulp.task('build', function() {
  sequence('clean', ['html', 'js', 'sass', 'css', 'img'], 'axe');
  sequence('clean', ['html', 'js', 'sass', 'css', 'img']);

});

gulp.task('default', function(){
  sequence('build', 'serve');
});
