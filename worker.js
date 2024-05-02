// Import the ise API
const { ise } = require(process.env.ise);

let currentCaseData = {};

console.log("initialized test extension");

// Handle case events
// ise.case.onUpdate2 is called whenever data about the case is update (see documentation for further information
ise.case.onUpdate2(
  (caseData) => {
    for (const type of caseData.types) {
      let iconData;
      switch (type) {
        case 'communication':
          // showIcon: boolean - Show the extension icon if caseData.id is set. If it is undefined it is not showing a case in the active tab.
          // value: string|number - Default the number, which is the value in the badge shown next to the icon, to zero.
          // A value of zero is not shown, if you wish the value of zero to be shown then value must be "0"
          // If there is a valid case id, update the count property to be the number of memos (caseData.body.length)
          if (caseData?.id) iconData = { showIcon: true, value: caseData.communication.data.memos.length };

          // Apply the iconData object to the extension.  This will force the icon to show/hide and display the number of memos next to it
          currentCaseData = caseData;
          break;
        case 'nocase':
          currentCaseData = {};
          iconData = { showIcon: false, value: 0 };
          break;
      }
      if (iconData) ise.extension.update(iconData);
      if (ise.window.isVisible()) sendCaseInfoToWindow();
    }
  },
  ['communication']
); // We are only interested in communications (this also returns basic case information)

// Handle events for the extension window
// ise.window.onShow is called whenever the extension window is opened or closed
ise.window.onShow(async (show) => {
  // If we are showing the window then send the current case data to the extension window
  if (show) sendCaseInfoToWindow();
});

// Utility function to send the current case information to the extension window
const sendCaseInfoToWindow = () => {
  ise.extension.sendEventToWindow('myextension-case-update', currentCaseData);
};