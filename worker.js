// Import the ise API
const { ise } = require(process.env.ise);
const fs = require("fs");
const path = require("path");

let kbaData ={};
let downloadPath = "";

// Handle events for the extension window
// ise.window.onShow is called whenever the extension window is opened or closed
ise.window.onShow((show) => {
  checkBackupFile();
  if (show){ 
    ise.download.getPath().then((downloadDir)=>{
      downloadPath = downloadDir;
    });
    loadKBAFile();   
  } else {
    ise.extension.sendEventToWindow("close-popups");
  }
});

//separated function, so it can be called by window event "reload-table" or window onShow
const loadKBAFile = () => {
  //Load KBA file and send data via kbaData to the extension window
    fs.readFile(path.join(__dirname, "kbas.csv"), 'utf8', (err,result)=>{
      if(err){
        //CSV file does not exist, create file
        fs.writeFile(path.join(__dirname,"kbas.csv"), "", function (err) {
          if (err) throw err;
        });
        ise.extension.sendEventToWindow("load-kba-file", "");
      }else{
        ise.extension.sendEventToWindow("load-kba-file", result);
      }
    });  
};

ise.events.onEvent('update-backup-file',()=>{
  checkBackupFile();
});


const checkBackupFile = () => {

  let localFileExists;
  let backupFileExists;
  
    //Check if local file exists
  fs.readFile(path.join(__dirname, "kbas.csv"), 'utf8', (err,result)=>{
    if(err){
      localFileExists = false;
    }else{
      localFileExists = true;
    }
  });

  setTimeout(() => {
      //Check if backup file exists
  fs.readFile(path.join(downloadPath, "ise_scratchpad_backup - do not delete.csv"), 'utf8', (err,backupResult)=>{
    if(err){
      backupFileExists = false;
    }else{
      backupFileExists = true;
    }
  });
  }, 1000);

  

  setTimeout(() => {
    
    if(!backupFileExists && !localFileExists){
      //Create empty backup file
      fs.writeFile(path.join(downloadPath,"ise_scratchpad_backup - do not delete.csv"), "", function (err) {
        if (err) throw err;
      });
    }else if (!backupFileExists && localFileExists){
      //Create backup file and update from existing local file
      fs.readFile(path.join(__dirname, "kbas.csv"), 'utf8', (err,result)=>{
        if(err){
          throw err;
        }else{
          fs.writeFile(path.join(downloadPath,"ise_scratchpad_backup - do not delete.csv"), result, function (err) {
            if (err) throw err;
          });
        }        
      });
    }else if (backupFileExists && !localFileExists){
      //Create local file from backup
      ise.extension.sendEventToWindow("show-backup-detect-info");
      fs.readFile(path.join(downloadPath,"ise_scratchpad_backup - do not delete.csv"), 'utf8', (err,result)=>{
        if(err){
          throw err;
        }else{
          fs.writeFile(path.join(__dirname, "kbas.csv"), result, function (err) {
            if (err){
              throw err;
            } else{
              loadKBAFile();
            }
          });
        }        
      });
    }else{
      //Update existing backup file from local
      fs.readFile(path.join(__dirname, "kbas.csv"), 'utf8', (err,result)=>{
        if(err){
          throw err;
        }else{
          fs.writeFile(path.join(downloadPath,"ise_scratchpad_backup - do not delete.csv"), result, function (err) {
            if (err) throw err;
          });
        }        
      });
    }
    
  }, 1200);
  
};

ise.events.onEvent('load-backup-file',()=>{
  fs.readFile(path.join(downloadPath,"ise_scratchpad_backup - do not delete.csv"), 'utf8', (err,result)=>{
    if(err){
      throw err;
    }else{
      fs.writeFile(path.join(__dirname, "kbas.csv"), result, function (err) {
        if (err) throw err;
      });
    }        
  });
});

ise.events.onEvent('reload-table',()=>{
  loadKBAFile();
});

ise.events.onEvent('update-csv',(currentKbaData)=>{
  let csvData = currentKbaData.join("||");
  fs.writeFileSync(path.join(__dirname, "kbas.csv"), csvData);
});

//Send __dirname to page JS
ise.events.onEvent('get-dir-path',()=>{
  ise.extension.sendEventToWindow("receive-dir-path", __dirname);
});

ise.events.onEvent('reset-csv',()=>{
  fs.writeFile(path.join(__dirname,"kbas.csv"), "", function (err) {
    if (err) throw err;
  });
});

ise.events.onEvent('read-import-file',(path)=>{
  fs.readFile(path, 'utf8', (err,result)=>{
    if(err){
      ise.extension.sendEventToWindow("update-import-file", "error");
    }else{
      ise.extension.sendEventToWindow("update-import-file", result);
    }
  });  
});

