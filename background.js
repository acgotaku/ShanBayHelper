chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {
        chrome.pageAction.show(tabId);
        if (!chrome.runtime.onConnect.hasListeners()) {            
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "ShanBayHelper");
                // chrome.pageAction.onClicked.addListener(function(){
                //     port.postMessage({
                //         method: 'toggle',
                //         data: 'click'
                //     });
                //     console.log("Hello");
                // });
                port.onMessage.addListener(function(request) {
                    console.log(request);
                    switch(request.method){
                        case "getLocalStorage":
                            port.postMessage({data: localStorage});
                            break;
                        case "setLocalStorage":
                            window.localStorage=request.data;
                            port.postMessage({data: localStorage});
                            break;
                        case 'lookup':
                            isUserSignedOn(function() {
                                queryWord(request.data,port);
                            });
                            //port.postMessage({data:{tabid:sender.tab.id}})
                            break;
                        case 'addWord':
                            addNewWordInBrgd(request.data,sendResponse);
                            break;
                        case 'openSettings':
                            chrome.tabs.create({url: chrome.runtime.getURL("options.html")+'#'+request.anchor});
                            port.postMessage({data:{tabid:sender.tab.id}})
                            break;
                        default :
                            port.postMessage({data:[]}); // snub them.
                    }
                });
            });
        }     

    }
});

//检查用户是否已经登录扇贝网
function isUserSignedOn(callback) {
    chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'username'}, function (cookie) {
        if (cookie) {
            localStorage.setItem('shanbay_cookies', cookie);
            callback();
        } else {
            localStorage.removeItem('shanbay_cookies');
            var url="http://www.shanbay.com/accounts/login/"
            var opt={
                type: "basic",
                title: "登陆",
                message: "登陆扇贝网后方可划词查义",
                iconUrl: "images/logo128.png"
            }
            var notification = chrome.notifications.create(url,opt,function(notifyId){return notifyId});
            chrome.notifications.onClicked.addListener( function (notifyId) {
                chrome.notifications.clear(notifyId,function(){});
                chrome.tabs.create({
                    url:url
                })
            });
            setTimeout(function(){
                chrome.notifications.clear(url,function(){});
            },5000);
        }
    });
}
//查词

var API='https://api.shanbay.com/bdc/search/?word=';

function queryWord(word,port){
    var parameter = {'url': API+word, 'dataType': 'json', type: 'GET'};
    $.ajax(parameter)
       .done(function(json, textStatus, jqXHR){
            console.log(json);
            port.postMessage(json);
       })
       .fail(function(jqXHR, textStatus, errorThrown) {
            $("#send_test").html(textStatus + "\u9519\u8BEF\uFF0C\u70B9\u51FB\u91CD\u65B0\u6D4B\u8BD5");
        });
}
