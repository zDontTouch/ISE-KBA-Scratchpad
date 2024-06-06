// Import the ise API
const { ise } = require(process.env.ise);
const fs = require("fs");

// Handle events for the extension window
// ise.window.onShow is called whenever the extension window is opened or closed
ise.window.onShow((show) => {
  if (show){
    try{
      fs.promises.readFile("./kbas.txt").then(function(result){
        navigator.clipboard.writeText(result);
      })
    }catch(error){
      ise.window.maximize();
    }
    
  }
});
