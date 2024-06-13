const gulp = require("gulp");
const scss = require("gulp-sass");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const cleanCSS = require("gulp-clean-css");
const imagemin = require('gulp-imagemin');
const imageminJpg = require('imagemin-jpeg-recompress');
const imageminPng = require('imagemin-pngquant');
const imageminGif = require('imagemin-gifsicle');
const svgmin = require('gulp-svgmin');
const notifier = require("node-notifier");
const sass = require("gulp-sass")(require('sass'));

const paths = {
  'src': {
    'scss': './src/scss/**/*.scss',
    'js': './src/js/**/*.js',
    'imgs': './src/imgs/**/*.+(jpg|jpeg|png|gif)',
    'svgs': './src/imgs/**/*.+(svg)',
  },
  'assets': {
    'css': './assets/css/',
    'js': './assets/js/',
    'imgs': './assets/imgs/',
  }
};

const onError = function (error) {
  notifier.notify({
    message: "しっぱいしたワン",
    title: "パグ"
  });
  console.log(error.message);
};

// 画像の圧縮タスク
const imageMin = (cb) => {
  gulp.src(paths.src.imgs)
    .pipe(imagemin([
      imageminPng(),
      imageminJpg(),
      imageminGif({
        interlaced: false,
        optimizationLevel: 3,
        colors: 180
      })
    ]))
    .pipe(gulp.dest(paths.assets.imgs));
  cb();
};

// svg画像の圧縮タスク
const svgMin = (cb) => {
  gulp.src(paths.src.svgs)
    .pipe(svgmin())
    .pipe(gulp.dest(paths.assets.imgs));
  cb();
};

// タスクの定義
exports.imageMin = imageMin;
exports.svgMin = svgMin;

// デフォルトのタスク
exports.default = gulp.series(gulp.parallel(imageMin, svgMin), (cb) => {
  console.log("Default task completed");
  cb();
});

// scssのコンパイルタスク
const compileScss = (cb) => {
  gulp.src([paths.src.scss, "!./src/scss/**/_*.scss", "!./src/scss/app.scss", "!./src/scss/top.scss"])
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass({ outputStyle: "expanded" }))
    .pipe(gulp.dest(paths.assets.css));

  // gulp.src(['./src/scss/common.scss', './src/scss/pages/top.scss'])
  //   .pipe(plumber({ errorHandler: onError }))
  //   .pipe(sass({ outputStyle: "expanded" }))
  //   .pipe(gulp.dest(paths.assets.css))
  //   .pipe(cleanCSS())
  //   .pipe(rename({ extname: '.min.css' }))
  //   .pipe(gulp.dest(paths.assets.css));

  cb();
};

// jsのコンパイルタスク
const compileJs = (cb) => {
  gulp.src(paths.src.js)
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(paths.assets.js));
  cb();
};

// ウォッチタスク
const watch = (cb) => {
  gulp.watch(paths.src.scss, gulp.series(compileScss));
  gulp.watch(paths.src.js, gulp.series(compileJs));
  gulp.watch(paths.src.imgs, gulp.series(imageMin));
  gulp.watch(paths.src.svgs, gulp.series(svgMin));
  cb();
};

// タスクの登録
exports.compileScss = compileScss;
exports.compileJs = compileJs;
exports.watch = watch;
