/*
 * Entry point for the watch app
 */
import document from "document";
import { Accelerometer } from "accelerometer";
import { HeartRateSensor } from "heart-rate";
import { Gyroscope } from "gyroscope";
import * as fs from "fs";
import { outbox } from "file-transfer";


let thisDate = new Date();
let recFilename = `/private/data/RawDataLogger-${thisDate.getFullYear()}${("0" + (thisDate.getMonth() + 1)).slice(-2)}${("0" + (thisDate.getDate())).slice(-2)}.txt`;
console.log(recFilename);
let fileID = null;

let buffer = new ArrayBuffer(8);

let accel = new Accelerometer();
let hrm = new HeartRateSensor();
let gyro = new Gyroscope();


let btnRecord = document.getElementById('myButton');


let recording = false;
let recFunction = null;

btnRecord.onclick = function(evt){
  console.log("button clicked");
  if (recording) {
    recording = false;
    btnRecord.text = "Record";   
    
    // Stop Device Sensors
    accel.stop();
    hrm.stop();
    gyro.stop();
 
    // Cancel the recording function
    clearInterval(recFunction);
    
    // Dev Check - Check the stats of the file written
    let stats = fs.statSync(recFilename);
    if (stats) {
      console.log("File size: " + stats.size + " bytes");
      console.log("Last modified: " + stats.mtime);
    }
    // Close the file
    fs.closeSync(fileID);

   outbox
     .enqueueFile(recFilename)
     .then((ft) => {
       console.log(`Transfer of ${ft.name} successfully queued.`);
     })
     .catch((error) => {
       console.log(`Failed to schedule transfer: ${error}`);
     })
  } else {
    recording = true;
    btnRecord.text = "Stop";
    
    // Start Device Sensors
    accel.start();
    hrm.start();
    gyro.start();
    
    // Init the file
    fileID = fs.openSync(recFilename, "a+");
    
    // Set callback recording function
    recFunction = setInterval(refreshData, 1000);
    
   }
}
const dirIter;
const listDir = fs.listDirSync("/private/data");
while((dirIter = listDir.next()) && !dirIter.done) {
  console.log(dirIter.value);
  //fs.unlinkSync(dirIter.value);
  
}

function refreshData() {
  // Populate ArrayBuffer
  buffer[0] = thisDate.getTime();
  buffer[1] = hrm.heartRate ? hrm.heartRate : 0;
  buffer[2] = accel.x ? accel.x.toFixed(1) : 0;
  buffer[3] = accel.y ? accel.y.toFixed(1) : 0;
  buffer[4] = accel.z ? accel.z.toFixed(1) : 0;
  buffer[5] = gyro.x ? gyro.x.toFixed(1) : 0;
  buffer[6] = gyro.y ? gyro.y.toFixed(1) : 0;
  buffer[7] = gyro.z ? gyro.z.toFixed(1) : 0;
  
  // Write ArrayBuffer to file
  fs.writeSync(fileID, buffer);
}
console.log("App code started");
