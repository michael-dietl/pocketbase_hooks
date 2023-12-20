// pb_hooks/main.pb.js

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }
    return buf;
  }

// fires for every collection
onRecordAfterCreateRequest((e) => {
    console.log(JSON.stringify(e.httpContext, null, 4));
    console.log(JSON.stringify(e.record, null, 4));
    console.log(JSON.stringify(e.uploadedFiles, null, 4));

    //const cmd = $os.exec('gulp', ' --cwd "/opt/pocketbase/pb_hooks" --gulpfile "/opt/pocketbase/pb_hooks/gulpfile.js" --tasks');
    //const cmd = $os.exec('/opt/pocketbase/pb_hooks/tst','');
    const cmd = $os.exec('ls','');
    cmd.dir = '/opt/pocketbase/pb_hooks';
    console.log(cmd.string());		
    //cmd.run();
    console.log(cmd.dir);


    // prepare the command to execute
    const md = $os.cmd('/opt/pocketbase/pb_hooks/tst', '');

    // execute the command and return its standard output as string
    const output = String.fromCharCode(...md.combinedOutput());    
    console.log(output);
})