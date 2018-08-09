/*eslint-env node */
const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');

const paths = {
  css: {
    src: 'css/*',
    dest: 'dist/css/'
  },
  images: {
    src: 'img/*.jpg',
    dest: 'dist/img/sizes/'
  },
  sw: {
    src: './sw.js',
    dest: 'dist/'
  },
  manifest: {
    src: './manifest.json',
    dest: 'dist/'
  },
  js: {
    lintsrc: 'js/**/*.js',
    concatsrc: [
      'js/idb.js',
      'js/dbhelper.js'
    ],
    src: [
      'js/main.js',
      'js/restaurant_info.js'
    ],
    dest: 'dist/js/'
  },
  html: {
    src: './*.html',
    dest: 'dist/'
  },
  imgs: {
    src: './img/*.jpg',
    dest: 'dist/img/'
  }
};

gulp.task('copy-imgs', () => {
  gulp.src(paths.imgs.src)
    .pipe(gulp.dest(paths.imgs.dest));
});

gulp.task('copy-html', () => {
  gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest));
});

gulp.task('styles', () => {
  gulp.src(paths.css.src)
    .pipe(autoprefixer({
      browsers: ['last 2 versions']
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.stream());
});

gulp.task('copy-private-scripts', () => {
  gulp.src(paths.js.src)
    .pipe(gulp.dest(paths.js.dest));
});

gulp.task('copy-sw', () => {
  gulp.src(paths.sw.src)
    .pipe(gulp.dest(paths.sw.dest));
});

gulp.task('copy-manifest', () => {
  gulp.src(paths.manifest.src)
    .pipe(gulp.dest(paths.manifest.dest));
});

gulp.task('concat-common-scripts', () => {
  gulp.src(paths.js.concatsrc)
    .pipe(concat('index.js'))
    .pipe(gulp.dest(paths.js.dest));
});

const gulpTaskList = [
  'copy-imgs',
  'copy-html',
  'styles',
  'concat-common-scripts',
  'copy-private-scripts',
  'copy-sw',
  'copy-manifest'
];

gulp.task('default', gulpTaskList, () => {
  gulp.watch('css/**/*.css', ['styles']);
  gulp.watch('/index.html', ['copy-html']);
  gulp.watch('./dist/index.html').on('change', browserSync.reload);

  browserSync.init({
    server: './dist'
  });
});