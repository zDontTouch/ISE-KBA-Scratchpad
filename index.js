
   ise.extension.initWindow(700);
   

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
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).getAttribute("href"));
   }

   function copyKbaIdAndName(id){
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).innerText);
   }

   async function copyKbaId(id){
    navigator.clipboard.writeText(document.getElementById("kba-name-id-"+id).innerText.split(" ")[0]);
   }

   function removeRow(id){
    //todo: As table and IDs don't get updated yet, delete only works botom-up
    document.getElementById("scratchpad-kbas").deleteRow(id);
   }

   ise.events.onEvent("load-kba-file",(kbaData)=>{
    if(kbaData!= null) {
      //create entries in extension window for each KBA
      let kbaRows = kbaData.split("\n");
      let windowKbaTable = document.getElementById("scratchpad-kbas");
      let windowKbaTableContent = document.createElement("table");
      windowKbaTableContent.setAttribute("class","table table-hover table-dark align-middle");
      windowKbaTableContent.setAttribute("id","scratchpad-kbas");
      
      for(let i=0; i<kbaRows.length; i++){
        let kbaRow = document.createElement("tr");
        kbaRow.setAttribute("id",i);
        
        let kbaRowContent = kbaRows[i].split(",");
        kbaRow.innerHTML = "<td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"removeRow("+i+")\">X</button></td><td><a style=\"text-decoration:none\" id=\"kba-name-id-"+i+"\" href=\""+kbaRowContent[2]+"\">"+kbaRowContent[0]+" - "+kbaRowContent[1]+"</a></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaLink("+i+")\">Copy Link</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaId("+i+")\">Copy ID</button></td><td><button class=\"btn btn-outline-secondary btn-sm\" onclick=\"copyKbaIdAndName("+i+")\">Copy ID+Name</button></td>"
        
        windowKbaTableContent.appendChild(kbaRow);
        
      }

      windowKbaTable.innerHTML = windowKbaTableContent.innerHTML;

    }else{
      console.log("no results");
    }
   });
   