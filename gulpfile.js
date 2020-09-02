const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();
const uglify = require("gulp-uglify");
const pipeline = require("readable-stream");
const htmlmin = require("gulp-html-minifier");




const copy = () => {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**/*.webp",
      "source/*.ico"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
};

exports.copy = copy;

const clean = () => {
  return del("build")
};

exports.clean = clean;

// Styles

const styles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream())
}

exports.styles = styles;

// Image

const images = () => {
  return gulp.src("source/img/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({ optimizationLevel: 3 }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.svgo({})
    ]))
    .pipe(gulp.dest("build/img"))
}

exports.images = images;


const sprite = () => {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;


const jsmin = () => {
  return gulp.src("source/js/script.js")
    .pipe(uglify())
    .pipe(gulp.dest("build"));
};

exports.jsmin = jsmin;


const minhtml = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest("build"))
};
exports.minhtml = minhtml;

const build = gulp.series(
  clean,
  copy,
  sprite,
  styles,
  jsmin,
  minhtml,
  images
);

exports.build = build;
// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("styles"));
  gulp.watch("source/*.html").on("change", sync.reload);
}

exports.default = gulp.series(
  build, server, watcher
);
