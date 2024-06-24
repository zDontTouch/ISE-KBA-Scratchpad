// Import the ise API
const { ise } = require(process.env.ise);
const fs = require("fs");
const path = require("path");

let kbaData ={};

// Handle events for the extension window
// ise.window.onShow is called whenever the extension window is opened or closed
ise.window.onShow((show) => {
  if (show){
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