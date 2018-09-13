/*!
 * gulp
 */

// Load plugins
const gulp = require('gulp'),
    htmlmin = require('gulp-htmlmin'),
    cleancss = require('gulp-clean-css')
   // sass = require('gulp-ruby-sass'),
   // autoprefixer = require('gulp-autoprefixer'),
   // cssnano = require('gulp-cssnano'),
  //  eslint = require('gulp-eslint'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
   // rename = require('gulp-rename'),
    //concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    del = require('del'),
    runSequence = require('run-sequence');

// html
gulp.task('html', function (done) {
   gulp.src('src/*.html')
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(gulp.dest('dist'))
      .pipe(notify({ message: 'HTML task complete' }));
      done();
  });    

// Styles
gulp.task('styles', function() {
    return gulp.src('src/css/*.css')
      .pipe(cleancss())
      .pipe(gulp.dest('dist/css'))
      .pipe(notify({ message: 'Styles task complete' }));
  }); 
  
// Scripts
gulp.task('scripts', function() {
    return gulp.src('src/**/*.js')   
      .pipe(uglify())
      .pipe(gulp.dest('dist'))
      .pipe(notify({ message: 'Scripts task complete' }));
  });
  /*
    .pipe(concat('main.js'))
      .pipe(gulp.dest('dist/js'))
      .pipe(rename({ suffix: '.min' }))
      */
//manifest.json
gulp.task('manifest', function() {
  return gulp.src('src/manifest.json')   
    .pipe(uglify())
    .pipe(gulp.dest('dist'))
    .pipe(notify({ message: 'Manifest task complete' }));
});
// Images
gulp.task('images', function() {
    return gulp.src('src/img/**/*')
      .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
      .pipe(gulp.dest('dist/img'))
      .pipe(notify({ message: 'Images task complete' }));
  });

// Clean
gulp.task('clean', function() {
    return del(['dist/*.html','dist/css', 'dist/js', 'dist/img']);
  });
  
// Default task
gulp.task('default', ['clean'], function(done) {
    runSequence('html','styles', 'scripts', 'manifest', 'images');
    done();
  });

// Watch
gulp.task('watch', function() {

    // Watch .scss files
    gulp.watch('src/css/*.scss', ['styles']);
  
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
  
    // Watch manifest.json
    gulp.watch('src/manifest.json', ['manifest']);
  
    // Watch image files
    gulp.watch('src/img/**/*', ['images']);
  
    // Create LiveReload server
    livereload.listen();
  
    // Watch any files in dist/, reload on change
    gulp.watch(['dist/**']).on('change', livereload.changed);
  
  });