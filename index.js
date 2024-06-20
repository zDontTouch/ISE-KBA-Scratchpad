
   ise.extension.initWindow(750);
   ise.window.setMinimumSize(750);
   
   let currentKbaData = [];
   let isReorderActive = false;
   let extensionDirectory = "";

   /* Intercept clicks which have an href - these should be opened in an ISE tab, not the extension window */
   document.addEventListener("click", (e) => {
     e.preventDefault(); /* Stop the default action */

     if (e.target?.href) {
       /* If the href starts with file: then it was a relative URL (usually starting with /)
          repoint it to https://items.services.sap */
       const url = e.target.href.startsWith("file:")
         ? e.target.attributes.href.nodeValue
         : e.target.href;
       /* Open the URL as an ISE tab in the foreground (show:true) */
       ise.tab.add(url, { show: true });
     }
   });

   function copyKbaLink(id){
    navigator.clipboard.writeText("https://me.sap.com/notes/"+id);
   }

   function copyKbaIdAndName(id){
    let selectedKBA = currentKbaData[id].split(",");
    navigator.clipboard.writeText(selectedKBA[0]+" - "+selectedKBA[1]);
   }

   function copyKbaId(id){
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).innerText.split(" ")[0]);
   }

   function removeRow(id){
    document.getElementById("scratchpad-kbas").deleteRow(id);
    
    currentKbaData.splice(id,1);
    
    ise.extension.sendEventToWorker('update-csv',currentKbaData);
    ise.extension.sendEventToWorker('reload-table');
    //isReorderActive = false;
  }

   ise.events.onEvent("load-kba-file",(kbaData)=>{
    //Update extension directory for import/export functions
    ise.extension.sendEventToWorker('get-dir-path');

    //clear new KBA input box and close error
    document.getElementById("newKbaInput").value = "";
    document.getElementById("kba-format-error").style.display = "none";
    setKbaTable(kbaData);
    if(isReorderActive){
      //if the reorder commands were being displayed before the reload, set the flag to false to retrigger them
      isReorderActive = false;
      toggleReorder();
    }
   });

   function setKbaTable(kbaData){

    if(kbaData!= "") {
      //remove the "No KBA" div
      let noKbaDiv = document.getElementById("no-kba");
      if(noKbaDiv != null){
        noKbaDiv.parentElement.removeChild(noKbaDiv);
      }

      //split CSV
      let kbaRows = kbaData.split(";");
      //update current KBA data (used for indexes) from file
      currentKbaData = kbaRows;
      let windowKbaTable = document.getElementById("scratchpad-kbas");
      let windowKbaTableContent = document.createElement("table");
      windowKbaTableContent.setAttribute("class","table table-hover table-dark align-middle");
      windowKbaTableContent.setAttribute("id","scratchpad-kbas");
      
      //create entries in extension window for each KBA
      for(let i=0; i<kbaRows.length; i++){
        let kbaRow = document.createElement("tr");
        kbaRow.setAttribute("id",i);
        
        let kbaRowContent = kbaRows[i].split(",");
        kbaRow.innerHTML = "<td><button id=\"btn-delete-"+i+"\" class=\"btn btn-outline-secondary btn-sm\" onclick=\"removeRow("+i+")\"><span class=\"iconTrash\"></span></button></td><td><a style=\"text-decoration:none;\" id=\"kba-name-id-"+i+"\" title=\""+kbaRowContent[1]+"\" href=\""+kbaRowContent[2]+"\">"+kbaRowContent[0]+" - "+kbaRowContent[1].slice(0,67)+((kbaRowContent[1].length >67) ? "..." : "")+"</a></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaLink("+kbaRowContent[0]+")\"><span class=\"iconCopy\"></span><br> Ext. Link</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaId("+i+")\"><span class=\"iconCopy\"></span><br> KBA ID</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaIdAndName("+i+")\"><span class=\"iconCopy\"></span><br>ID+Name</button></td>"
        
        windowKbaTableContent.appendChild(kbaRow);
        
      }

      windowKbaTable.innerHTML = windowKbaTableContent.innerHTML;

    }else{
      let windowKbaTable = document.getElementById("windowContent");
      //remove the "No KBA" div if exists
      let noKbaDiv = document.getElementById("no-kba");
      if(noKbaDiv == null){
        windowKbaTable.innerHTML = "<div id=\"no-kba\" align=\"center\">No KBAs</div>"+windowKbaTable.innerHTML;
      }
      
    }

   }

   function addKba(){
    //trim and split new KBA string (<kbaid> - <kbaname>)
    let kbaSplit = document.getElementById("newKbaInput").value.trim().split(" - ");
    //detect if KBA was entered as "X - Y" or "X-Y" ("X - Y" will fail to split into array)
    if(kbaSplit.length<2){
      kbaSplit = document.getElementById("newKbaInput").value.split("-");
    }

    if(kbaSplit.length>1){
    //create CSV entry, update CSV file and reload table
    currentKbaData.push(kbaSplit[0]+","+kbaSplit[1]+","+"https://support.wdf.sap.corp/sap/support/notes/"+kbaSplit[0]);
    ise.extension.sendEventToWorker('update-csv',currentKbaData);
    ise.extension.sendEventToWorker('reload-table');
    document.getElementById("kba-format-error").style.display = "none";

    }else{
      //display error message if KBA format is not correct
      document.getElementById("kba-format-error").style.display = "block";
    }

    document.getElementById("newKbaInput").value = "";
   }

   function menuDropdown(){
    document.getElementById("menuDropdown").classList.toggle("show");
   }

   function toggleReorder(){

      if(isReorderActive == false){
        let kbaTable = document.getElementById("scratchpad-kbas").rows;
        let i;
        for (i=0; i<kbaTable.length; i++){
          //create container and reorder buttons
          let reorderButtonsDiv = document.createElement("div");
          let reorderButtonUp = document.createElement("button");
          let reorderButtonDown = document.createElement("button");

          //set container
          reorderButtonsDiv.setAttribute("style","heigth:90%;");

          //set buttons
          reorderButtonUp.innerHTML = "↑";
          reorderButtonDown.innerHTML = "↓";
          
          reorderButtonUp.setAttribute("class","btn btn-outline-light btn-sm");
          reorderButtonUp.setAttribute("style","margin-bottom:2%;");
          reorderButtonDown.setAttribute("class","btn btn-outline-light btn-sm");
          reorderButtonDown.setAttribute("style","margin-top:2%;");

          reorderButtonUp.setAttribute("onclick","reorder("+i+",\"up\")");
          reorderButtonDown.setAttribute("onclick","reorder("+i+",\"down\")");

          //append to container
          reorderButtonsDiv.appendChild(reorderButtonUp);
          reorderButtonsDiv.appendChild(reorderButtonDown);

          kbaTable[i].appendChild(reorderButtonsDiv);
        }
        isReorderActive = true;
      }else{
        ise.extension.sendEventToWorker('update-csv',currentKbaData);
        ise.extension.sendEventToWorker('reload-table');
        isReorderActive = false;
      }
   }

   function reorder(id,direction){
    if(direction == "up"){
      //first row cannot be moved up
      if(id!=0){
        let temp = currentKbaData[id-1];
        currentKbaData[id-1] = currentKbaData[id];
        currentKbaData[id] = temp;
      }
    }else{
      //last row cannot be moved down
      if(id!=(currentKbaData.length-1)){
        let temp = currentKbaData[id+1];
        currentKbaData[id+1] = currentKbaData[id];
        currentKbaData[id] = temp;
      }
    }

    ise.extension.sendEventToWorker('update-csv',currentKbaData);
    ise.extension.sendEventToWorker('reload-table');
   }

   //Request __dirname from worker
   ise.events.onEvent("receive-dir-path", (dirPath) => {
    extensionDirectory = dirPath;
   });

   function exportCsvFile(){
    //update current extension directory
    const a = document.createElement('a');
    a.href = "file:"+extensionDirectory + "/kbas.csv";
    a.download = "kbas.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
   }

   function importCsvFile(){
    var input = document.createElement('input');
    input.type = 'file';
    input.click();
   }

   function resetCsvFile(){
    ise.extension.sendEventToWorker('reset-csv');
    currentKbaData = [];
    let kbaTable = document.getElementById("scratchpad-kbas");
    kbaTable.innerHTML = "";
    ise.extension.sendEventToWorker('reload-table');
   }