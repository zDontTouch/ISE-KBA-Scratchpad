// Import the ise API
const { ise } = require(process.env.ise);
const fs = require("fs");

let kbaData ={};

// Handle events for the extension window
// ise.window.onShow is called whenever the extension window is opened or closed
ise.window.onShow((show) => {
  if (show){
    loadKBAFile();    
  }
});

//separated function, so it can be called by window event "reload-table" or window onShow
const loadKBAFile = () => {
  //Load KBA file and send data via kbaData to the extension window
  fs.readFile("kbas.csv", 'utf8', (err,result)=>{
    ise.extension.sendEventToWindow("load-kba-file", result);
  });
};

ise.events.onEvent('reload-table',()=>{
  loadKBAFile();
});

ise.events.onEvent('update-csv',(currentKbaData)=>{
  let csvData = currentKbaData.join(";");
  fs.writeFileSync("./kbas.csv", csvData);
});