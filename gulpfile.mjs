import { createRequire } from 'module';
const require = createRequire(import.meta.url);

var gulp=require('gulp');                           // https://www.npmjs.com/package/gulp
var ExifImage = require('exif').ExifImage;          // https://www.npmjs.com/package/exif
var notify = require('gulp-notify');                // https://www.npmjs.com/package/gulp-notify
var argv = require('yargs').argv;                   // https://www.npmjs.com/package/yargs
var geolib = require ('geolib');                    // https://www.npmjs.com/package/geolib
var gm = require('gulp-gm');
var newer = require('gulp-newer');
var ffmpeg = require('ffmpeg');                     // https://www.npmjs.com/package/ffmpeg

// heic processing
//var promisify  = require('util.promisify');
const promisify = require("es6-promisify");
var fs = require('fs');
var convert = require('heic-convert');


import PocketBase from 'pocketbase';                // https://pocketbase.io/
import chalk from 'chalk';                          // https://blog.logrocket.com/using-console-colors-node-js/
import imagemin from 'gulp-imagemin';
import exifr from 'exifr/dist/full.esm.mjs'

const log = console.log;
chalk.level = 1;                                    // Use colours in the VS Code Debug Window


function processFiles(cb) {
    log(chalk.green('Process File'));

    var filenames = argv.filenames;
    var id =argv.id;
    var collectionId = argv.collectionId;

    log(chalk.bgGray('ID=' + id));
    log(chalk.bgGray('collectionId=' + collectionId));
    log(chalk.bgGray('Files=' + filenames));

    const f = filenames.split(',');

    f.forEach(element => {
      log(chalk.bgGray('File=' + '/opt/pocketbase/pb_data/storage/' + collectionId + '/' + id + '/' + element));  
      processFile(cb, '/opt/pocketbase/pb_data/storage/' + collectionId + '/' + id + '/' + element);
    });

    cb();
}

function processFile(cb,f) {
    log(chalk.green('Process File'));

    var filename = '';
    log(chalk.bgBlue(typeof(f)));
    if (typeof(f) == 'undefined') {
        filename = argv.filename;
        console.log(filename);
    } else {
        filename = f;
    }
      

    let s = String(filename).toLowerCase().split('.');
    log(chalk.bgBlue(s[1]));
    switch (s[1]) {
        case 'jpg'  : processImages(filename);
                      break;
        case 'jpeg' : processImages(filename);
                      break;        
        case 'png'  : processImages(filename);
                      break;        
        case 'heic' : heicConvert(filename);
                      filename = filename.substring(0, filename.lastIndexOf(".")) + '.jpg';  
                      break;        

        //case 'mp4'  : processVideos(filename);
        //              break;        
        case 'mov'  : processVideos(filename);
        break;        

    }

    return gulp.src('gulpfile.mjs').pipe(notify({title: "Pocketbase FileProcessor", message: 'Sucessfully processed ' + filename }));
}

function heicConvert(filename) {
    log(chalk.green('..heicConvert'));
    let inputBuffer = fs.readFileSync(filename);
        convert({
            buffer: inputBuffer, // the HEIC file buffer
            format: 'JPEG',      // output format
            quality: 1           // the jpeg compression quality, between 0 and 1
          }).then(function (outputBuffer) {
                let targetFile = filename.substring(0, filename.lastIndexOf(".")) + '.jpg';
                fs.writeFileSync(targetFile, outputBuffer);
                fs.rmSync(filename);
                fs.rmSync(filename + '.attrs');
                //console.log(fs.readFileSync(targetFile));

                const pb = new PocketBase('http://127.0.0.1:8090');
    
                const authData = pb.admins.authWithPassword('michael@dietl-family.de', 'Toskana4Dream%678').then(function (authdata) {

                // finally process Image    
                processImages(targetFile);
          });
    return 1;      
}

function processVideos(filename) {
    log(chalk.bgCyanBright('Process Videos'));

    try {

        let targetFile = filename.substring(0, filename.lastIndexOf("."));
        var process = new ffmpeg(filename);
        console.log(process);
        process.then(function (video) {
            console.log('The video is ready to be processed');
            video
            //.setVideoSize('1920x?', true, true)
            .setAudioChannels(2)
            .save(targetFile + '_1.mp4', function (error, file) {
                if (!error)
                    log(chalk.bgCyanBright('Video file: ' + file));
                else 
                    log(chalk.bgRed('Video file: ' + file));
            });
            console.log('The video is ready to be processed 2');
    
        }, function (err) {
            log(chalk.bgRed('Error: ' + err));
        });
    } catch (e) {
        console.log(e.code);
        console.log(e.msg);
    }    

    return true;
}

function processImages(filename) {
    log(chalk.bgCyanBright('processImages'));

    setTimeout(function(){
    }, 5000);    
    try {
        log(chalk.bgCyanBright('ExifImage - ' + filename));
        new ExifImage({ image : filename }, function (error, exifData) {
            if (error)
                log(chalk.bgYellow('Info: '+ error.message));
            else
                if (exifData !== 'undefined') {
                    console.log(exifData); 
                    processExif(exifData, filename);
                }
        });
    } catch (error) {
        log(chalk.bgRed('ExifError: ' + error.message));
    }
   let targetDirectory = filename.substring(0, filename.lastIndexOf("/"));
  
    // minify the image
    gulp.src(filename)
    //.pipe(newer(filename))
    .pipe(gm(function(gmfile) {
        gmfile.quality(90);
        return gmfile.resize(1920, 1080);
      }))
    .pipe(imagemin())
    .pipe(gulp.dest(targetDirectory));    
}

function processExif(exifData, filename) {
    let ex = JSON.parse(JSON.stringify(exifData, null, 4));

    if ((ex.gps.GPSLatitudeRef !== 'undefined') && (ex.gps.GPSLatitudeRef !== '')) {
        exifr.gps(filename).then(function(coord){
            console.log('EXIFR: ' + coord.latitude + ' - ' + coord.longitude);
            let latFinal = coord.latitude;
            let longFinal = coord.longitude;

            let timestamp = ex.image.ModifyDate;

            log (chalk.bgMagenta(latFinal + '  --  ' + longFinal));

            let p = String(filename).split('/');
            let id = p[6];

            const pb = new PocketBase('http://127.0.0.1:8090');
    
            const authData = pb.admins.authWithPassword('michael@dietl-family.de', 'Toskana4Dream%678').then(function (authdata) {
                let tempD = timestamp.split(' ');
                tempD[0] = tempD[0].replace(':', '-');
                var date =  new Date(tempD[0] + ' ' +tempD[1] + '.000Z');
                let d = date.toISOString(); 
    
                log(chalk.bgBlueBright(d));
                
                let f = String(filename).split('/');
                let fn = f[6];

                console.log(fn);
    
                // create data
                const data = {
                    "timestamp": d,
                    "latitude": latFinal,
                    "longitude": longFinal,
                    "Files" : id
                };
    
                pb.collection('GeoLocations').create(data).then(function (record) {
                    console.log(record);  
                    let res = JSON.parse(JSON.stringify(record, null, 4));
    
                    log(chalk.bgCyanBright(id));
                    
                    const data = {
                        "id": id,
                        "Location": res.id,
                        "File": filename
                    };
                    
                    pb.collection('Files').update(id, data).then(function (record) {
                        console.log(record);
                    });
                } );        
            });
        })
    }
}

// define Gulp Tasks
gulp.task('processFile', processFile);
gulp.task('processFiles', processFiles);


