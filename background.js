chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        chrome.pageAction.show(tabId);
        chrome.pageAction.onClicked.addListener(function(){
            if (!chrome.runtime.onConnect.hasListeners()) {
                chrome.runtime.onConnect.addListener(function(port) {
                    console.assert(port.name == "ShanBayHelper");
                    port.onMessage.addListener(function(request) {
                        console.log(request);
                        switch(request.method){
                            case "getLocalStorage":
                                sendResponse({data: localStorage});
                                break;
                            case "setLocalStorage":
                                window.localStorage=request.data;
                                sendResponse({data: localStorage});
                                break;
                            case 'lookup':
                                isUserSignedOn(function() {
                                    getClickHandler(request.data, sender.tab);
                                });
                                sendResponse({data:{tabid:sender.tab.id}})
                                break;
                            case 'addWord':
                                addNewWordInBrgd(request.data,sendResponse);
                                break;
                            case 'openSettings':
                                chrome.tabs.create({url: chrome.runtime.getURL("options.html")+'#'+request.anchor});
                                sendResponse({data:{tabid:sender.tab.id}})
                                break;
                            default :
                                sendResponse({data:[]}); // snub them.
                        }
                    });
                });
            }
            
        });
    }
});

