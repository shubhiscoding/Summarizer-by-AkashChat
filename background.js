console.log("Background script loaded");

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed or updated");
  chrome.contextMenus.create({
    id: "summarizeSelection",
    title: "Summarize Selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "summarizeSelection") {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "summarize",
          text: info.selectionText
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Error: ", chrome.runtime.lastError.message);
          } else {
            console.log("Message sent successfully");
          }
        });
      });
    }
  });