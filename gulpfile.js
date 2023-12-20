var gulp=require('gulp');
var ExifImage = require('exif').ExifImage;
var notify = require('gulp-notify');



minifyImages=function (cb) {
    console.log('It works');

    try {
        new ExifImage({ image : '/opt/pocketbase/pb_data/storage/**/*/20220901_102634.jpg' }, function (error, exifData) {
            if (error)
                console.log('Error: '+error.message);
            else
                console.log(exifData); // Do something with your data!
        });
    } catch (error) {
        console.log('Error: ' + error.message);
    }
    //cb();
    return gulp.src('gulpfile.js').pipe(notify('Works'));
}


gulp.task('minifyImages', minifyImages);

