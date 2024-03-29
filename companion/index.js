import { inbox } from "file-transfer";
import * as fs from "fs";

async function processAllFiles() {
  let file;

  while ((file = await inbox.pop())) {
    
    console.log('poofy')

    const payload = await file.arrayBuffer();
    //const payload = await file.text();
    console.log(`file contents: ${payload}`);
    
    const typedArray = new Uint32Array(payload);
    const array = Array.from(typedArray)
    array.forEach((item) => {
      console.log(`item: ${item}`)
    })
    /*
    var data = await file.arrayBuffer();
    console.log('ArrayBuffer: ' + data);*/
  }
}

inbox.addEventListener("newfile", processAllFiles);

processAllFiles();

inbox.onnewfile = () => {
  console.log("New file!");
}
