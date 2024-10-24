# ISE-KBA-Scratchpad
The KBA Scratchpad is an extension for the SAP Integrated Support Environment (ISE), where users can easily store, open and reference commonly used KBAs.
The list can be easily managed by adding or deleting KBAs, reordering and searching, including keyboard shortcuts.
<p align="center">
  <img src="https://github.com/zDontTouch/ISE-KBA-Scratchpad/blob/fd6129c69354dc369c02b4b33e52577cc197f046/screenshots/KBA_scratchpad_mainpage.png" />
</p>

It has a streamlined UI that facilitates the usage of KBAs by including buttons to copy name, ID and customer URL in a single click. 
Once a case is open, it is also possible to directly attach KBAs from the list using a single button. The extension will open a background tab and attach the KBA to the case automatically.</br>
The extension also has a built-in "KBA to Case" feature, so users can take advantage of the automatic attachment of KBAs by simply typing the KBA ID and pressing enter (for situations where the desired KBA is not saved in the list).
<p align="center">
  <img src="https://github.com/zDontTouch/ISE-KBA-Scratchpad/blob/fd6129c69354dc369c02b4b33e52577cc197f046/screenshots/KBA_Scratchpad_3.png" />
</p>
Once a KBA ID is entered in the "KBA to Case" textbox, users can also use "Shift+C" to automatically copy the external URL of the KBA to the clipboard.</br></br>

For usability, the extension also enables users to export and import CSV KBA lists. A "patch notes" page is also available by clicking on the version number from the menu.
<p align="center">
  <img src="https://github.com/zDontTouch/ISE-KBA-Scratchpad/blob/fd6129c69354dc369c02b4b33e52577cc197f046/screenshots/KBA_Scratchpad_2.png" />
</p>

Importing a KBA file will incorporate the new KBAs to the existing list, without replacing it.</br></br>
Important notes:
* The extension saves the KBA list in a local file within the extension folder. Due to the way that updates are deployed in ISE, all files are replaced, causing the KBA list to be deleted with every version update. To prevent such situations, a backup file with the KBA list is automatically created in the user's default download folder during the extension usage. Whenever an update is released to the tool, the backup file is automatically imported and the following warning appears:
  <p align="center">
  <img src="https://github.com/zDontTouch/ISE-KBA-Scratchpad/blob/00959e545083b6ceaf0b0b33817eafb2be4a6c68/screenshots/Version%20update%20warning.png" />
</p>
Due to a known issue with Mac notebooks, it is currently not reliable to store the KBA list in the browser built-in storage, that is why this solution was implemented.
