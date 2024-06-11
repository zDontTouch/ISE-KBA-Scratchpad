
   ise.extension.initWindow(700);
   
   let currentKbaData;

   /* Intercept clicks which have an href - these should be opened in an ISE tab, not the extension window */
   document.addEventListener("click", (e) => {
     e.preventDefault(); /* Stop the default action */
     if (e.target?.href) {
       /* If the href starts with file: then it was a relative URL (usually starting with /)
          repoint it to https://items.services.sap */
       const url = e.target.href.startsWith("file:")
         ? "https://itsm.services.sap" + e.target.attributes.href.nodeValue
         : e.target.href;
       /* Open the URL as an ISE tab in the foreground (show:true) */
       ise.tab.add(url, { show: true });
     }
   });

   function copyKbaLink(id){
    navigator.clipboard.writeText("https://me.sap.com/notes/"+id);
    //navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).getAttribute("href"));
   }

   function copyKbaIdAndName(id){
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).innerText);
   }

   async function copyKbaId(id){
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).innerText.split(" ")[0]);
   }

   function removeRow(id){
    document.getElementById("scratchpad-kbas").deleteRow(id);
    
    currentKbaData.splice(id,1);
    
    ise.extension.sendEventToWorker('update-csv',currentKbaData);
    ise.extension.sendEventToWorker('reload-table');
  }

   ise.events.onEvent("load-kba-file",(kbaData)=>{
    setKbaTable(kbaData);
   });

   function setKbaTable(kbaData){

    if(kbaData!= "") {
      //remove the "No KBA" div
      let noKbaDiv = document.getElementById("no-kba");
      if(noKbaDiv != null){
        noKbaDiv.parentElement.removeChild(noKbaDiv);
      }

      //create entries in extension window for each KBA
      let kbaRows = kbaData.split(";");
      currentKbaData = kbaRows;
      let windowKbaTable = document.getElementById("scratchpad-kbas");
      let windowKbaTableContent = document.createElement("table");
      windowKbaTableContent.setAttribute("class","table table-hover table-dark align-middle");
      windowKbaTableContent.setAttribute("id","scratchpad-kbas");
      
      for(let i=0; i<kbaRows.length; i++){
        let kbaRow = document.createElement("tr");
        kbaRow.setAttribute("id",i);
        
        let kbaRowContent = kbaRows[i].split(",");
        kbaRow.innerHTML = "<td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"removeRow("+i+")\"><i class=\"fa fa-trash\"></i></button></td><td><a style=\"text-decoration:none;\" id=\"kba-name-id-"+i+"\" href=\""+kbaRowContent[2]+"\">"+kbaRowContent[0]+" - "+kbaRowContent[1].slice(0,67)+((kbaRowContent[1].length >67) ? "..." : "")+"</a></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaLink("+kbaRowContent[0]+")\"><i class=\"fa-regular fa-copy\"></i>Customer Link</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaId("+i+")\"><i class=\"fa-regular fa-copy\"></i>ID</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaIdAndName("+i+")\"><i class=\"fa-regular fa-copy\"></i> Copy ID+Name</button></td>"
        
        windowKbaTableContent.appendChild(kbaRow);
        
      }

      windowKbaTable.innerHTML = windowKbaTableContent.innerHTML;

    }else{
      let windowKbaTable = document.getElementById("windowContent");
      //remove the "No KBA" div
      let noKbaDiv = document.getElementById("no-kba");
      if(noKbaDiv == null){
        windowKbaTable.innerHTML = "<div id=\"no-kba\" align=\"center\">No KBAs</div>"+windowKbaTable.innerHTML;
      }
      
    }

   }

   function addKba(){
    //trim and split new KBA string (<kbaid> - <kbaname>)
    let kbaSplit = document.getElementById("newKbaInput").value.trim().split(" - ");
    if(kbaSplit.length<2){
      kbaSplit = document.getElementById("newKbaInput").value.split("-");
    }
    
    currentKbaData.push(kbaSplit[0]+","+kbaSplit[1]+","+"https://support.wdf.sap.corp/sap/support/notes/"+kbaSplit[0]);
    console.log(currentKbaData);
    ise.extension.sendEventToWorker('update-csv',currentKbaData);
    ise.extension.sendEventToWorker('reload-table');

    document.getElementById("newKbaInput").value = "";
   }