
   ise.extension.initWindow(900);
   

   /* Intercept clicks which have an href - these should be opened in an ISE tab, not the extension window */
   document.addEventListener("click", (e) => {
     e.preventDefault(); /* Stop the default action */
     if (e.target?.href) {
       /* If the href starts with file: then it was a relative URL (usually starting with /)
          repoint it to https://items.services.sap */
       const url = e.target.href.startsWith("file:")
         ? "https://itsm.services.sap" + e.target.attributes.href.nodeValue
         : e.target.href;
       /* Open the URL as an ISE tab in the background (show:false) */
       ise.tab.add(url, { show: false });
     }
   });

   function copyKbaLink(){
    navigator.clipboard.writeText("https://i7p.wdf.sap.corp/sap(bD1lbiZjPTAwMQ==)/bc/bsp/sno/ui_entry/entry.htm?param=69765F6D6F64653D3030312669765F7361706E6F7465735F6E756D6265723D3030303236303836333226");
   }

   function copyKbaIdAndName(){
    navigator.clipboard.writeText(document.getElementById("kba-id-name").innerText);
   }

   async function copyKbaId(){

   
    /*kbaid = document.getElementById("kba-id-name").innerText
    kbaid = kbaid.split(" ");
    navigator.clipboard.writeText(kbaid[0]);*/

    try{
        /*const fs = require("fs").promises;
        const data = await fs.readFile("kbas.txt");
        navigator.clipboard.writeText(data.toString());
        await fs.writeFile('test.csv','test cvs write file');*/

        //chrome.storage.local.set({ "kbaID" : "this string is stored" });
        /*chrome.storage.local.get(["kbaID"]).then((result) => {
          navigator.clipboard.writeText("bla"+result.kbaID);
        });*/
        fs.promises.readFile("./kbas.txt").then(function(result){
          navigator.clipboard.writeText(result);
        })

    }catch(error){
        navigator.clipboard.writeText(error);
    }
    
   }

   function removeRow(id){
    document.getElementById("scratchpad-kbas").deleteRow(id);
   }
   