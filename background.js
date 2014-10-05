chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    console.log(tab);
    if (changeInfo.status === 'loading') {
        chrome.pageAction.show(tabId);
        chrome.pageAction.onClicked.addListener(function(){
        	
        });
    }
});

