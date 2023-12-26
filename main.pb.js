// pb_hooks/main.pb.js

// fires for every collection
onRecordAfterCreateRequest((e) => {
    console.log(JSON.stringify(e.httpContext, null, 4));
    console.log(JSON.stringify(e.record, null, 4));
    console.log(JSON.stringify(e.uploadedFiles, null, 4));

    let n = JSON.parse(JSON.stringify(e.record, null, 4));

    const collectionName = n.collectionName;
    console.log(collectionName);

    if (collectionName == "Files") {
      console.log('\x1b[33mProcessing Files \x1b[0m');

      const filename = n.File;
      console.log(filename);
      const collectionId = n.collectionId;
      console.log(collectionId);
      const id = n.id;
      console.log(id);

      // prepare filename with path
      let f = 'processFile --filename=/opt/pocketbase/pb_data/storage/' + collectionId + '/' + id + '/' + filename;
      console.log(f);

      console.log('\x1b[33mCalling Runner \x1b[0m');
      // prepare the command to execute
      const md = $os.cmd('/opt/pocketbase/pb_hooks/runner', f);

      md.dir = '/opt/pocketbase/pb_hooks';
      console.log(md.dir);
  
      // execute the command and return its standard output as string
      const output = String.fromCharCode(...md.combinedOutput());    
      console.log(output);
    }

    if (collectionName == "Albums") {    
      console.log('\x1b[33mProcessing Multiple Files \x1b[0m');
      console.log(JSON.stringify(e.record, null, 4));
      
      let n = JSON.parse(JSON.stringify(e.record, null, 4));
      const collectionId = n.collectionId;
      console.log(collectionId);

      const id = n.id;
      console.log(id);

      const files = n.files;
      console.log(files);

      let f = 'processFiles --filenames='  + files + ' --collectionId=' + collectionId + ' --id='+id;

      const md = $os.cmd('/opt/pocketbase/pb_hooks/runner', f);

      md.dir = '/opt/pocketbase/pb_hooks';
      console.log(md.dir);
  
      // execute the command and return its standard output as string
      const output = String.fromCharCode(...md.combinedOutput());    
      console.log(output);
    }  
})