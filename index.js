
   ise.extension.initWindow(750);
   ise.window.setMinimumSize(750);
   
   let currentKbaData = [];
   let currentKbaDataBuffer = [];
   let importKbaData = [];
   let searchedKbaData = [];
   let isReorderActive = false;
   let isAddKbaInputActive = false;
   let isMenuActive = false;
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

   document.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault();
      if(document.activeElement.id == "newKbaInput"){
        addKba();
      }else{
        isAddKbaInputActive = false;
        toggleAddKba();
        document.getElementById("newKbaInput").focus();
      }
    }
  });

   function copyKbaLink(id){
    navigator.clipboard.writeText("https://me.sap.com/notes/"+id);
   }

   function copyKbaIdAndName(id){
    let selectedKBA = currentKbaData[id].split("█");
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
    currentKbaDataBuffer = kbaData;
    setKbaTable(kbaData);
    //if the reorder commands were being displayed before the reload, set the flag to false to retrigger them (as the reload will clear the table HTML)
    if(isReorderActive){
      isReorderActive = false;
      toggleReorder();
    }
  });

   ise.events.onEvent("close-popups",()=>{
    if(isReorderActive){
      toggleReorder();
    }

    if(isAddKbaInputActive){
      toggleAddKba();      
    }

    if(isMenuActive){
      menuDropdown();
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
      let kbaRows = kbaData.split("||");
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
        
        let kbaRowContent = kbaRows[i].split("█");
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

    //prevent issues if KBA title contains "-"
    if(kbaSplit.length>2){
      for(let i=2; i<kbaSplit.length; i++){
        kbaSplit[1] = kbaSplit[1]+" - "+kbaSplit[i];
      }
    }

    if(kbaSplit.length>1){
    //create CSV entry, update CSV file and reload table
    currentKbaData.push(kbaSplit[0]+"█"+kbaSplit[1]+"█"+"https://support.wdf.sap.corp/sap/support/notes/"+kbaSplit[0]);
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
    if(isMenuActive){
      isMenuActive = false;
    }else{
      isMenuActive = true;
    }
   }

   function toggleReorder(){
      if(currentKbaData.length!=0){
        if(!isReorderActive){
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

   ise.events.onEvent("update-import-file", (result) => {
    if(result != "error"){
      importedCsvFile = result;
    }else{
      document.getElementById("kba-format-error").style.display = "block";
    }
   });
   //ISSUE: IMPORT BUTTON ONLY WORKS FOR THE FIRST TIME
   function importCsvFile(){
    importedCsvFile = [];
    var input = document.createElement('input');
    input.setAttribute("accept",".csv");
    input.type = 'file';
    input.click();

    //catch path of the file selected
    input.onchange = e => { 
      //send path to worker to load the file
      console.log("reading from: "+e.target.files[0].path);
      ise.extension.sendEventToWorker('read-import-file', e.target.files[0].path);
      setTimeout(() => {
        console.log("Loaded content: "+importedCsvFile);
        let kbaRows = importedCsvFile.split("||");
      for(let i=0; i<kbaRows.length;i++){
        let kbaEntry = kbaRows[i].split("█");
        console.log(kbaRows[1]);
        if(kbaEntry.length==3){
          currentKbaData.push(kbaEntry[0]+"█"+kbaEntry[1]+"█"+kbaEntry[2]);
        }else{
          document.getElementById("kba-format-error").style.display = "block";
        }
      }
      ise.extension.sendEventToWorker('update-csv',currentKbaData);
      ise.extension.sendEventToWorker('reload-table');
      document.getElementById("kba-format-error").style.display = "none";
      }, 1000); 
    } 
   }


   function resetCsvFile(){
    ise.extension.sendEventToWorker('reset-csv');
    currentKbaData = [];
    let kbaTable = document.getElementById("scratchpad-kbas");
    kbaTable.innerHTML = "";
    ise.extension.sendEventToWorker('reload-table');
   }

   function toggleAddKba(){
    let tab = document.getElementById("addKbaTab");
    let kbaInput = document.getElementById("addKbaInput");
    if(!isAddKbaInputActive){
      tab.setAttribute("style","bottom:7.5%;");
      kbaInput.setAttribute("style","display:block;");
      isAddKbaInputActive = true;
    }else{
      tab.setAttribute("style","bottom:0%;");
      kbaInput.setAttribute("style","display:none;");
      isAddKbaInputActive = false;
    }
    
   }

  
  function searchKba(searchTerm){
    searchedKbaData = [];   
    //reset the KBA table before each search (in case user deletes a char from search, the search will re-search from all the list)
    setKbaTable(currentKbaDataBuffer);
    //if search box gets empty, the full list is displayed
    if(searchTerm != ""){
      for(let i=0;i<currentKbaData.length;i++){
        let currentKbaRow = currentKbaData[i].split("█");
        //using Regex for case insensitive search
        if(currentKbaRow[1].toString().toLowerCase().indexOf(searchTerm.toString().toLowerCase()) >= 0 || currentKbaRow[0].toString().indexOf(searchTerm.toString()) >= 0){
          searchedKbaData.push(currentKbaData[i]);
        }else{
        }
      }
      //if there are no results, search does nothing
      if(searchedKbaData.length!=0){
        setKbaTable(searchedKbaData.join("||"));
      }else{

      }
      
    }else{
      ise.extension.sendEventToWorker('reload-table');
    }
  }