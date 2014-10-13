chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'loading') {  
        if (!chrome.runtime.onConnect.hasListeners()) {            
            chrome.runtime.onConnect.addListener(function(port) {
                console.assert(port.name == "ShanBayHelper");
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
                            // getPageNum();
                            //testReadability(port);
                            isUserSignedOn(function() {
                                queryWord(request.data,port);
                            });
                            //port.postMessage({data:{tabid:sender.tab.id}})
                            break;
                        case 'setAction':
                            if(request.show==true){
                                console.log(port);
                                chrome.pageAction.show(port.sender.tab.id);
                            }
                            break;
                        case 'readArticle':
                            var readerPageHTML=chrome.extension.getURL("reader.html")
                            var parameter = {'url': readerPageHTML, 'dataType': 'html', type: 'GET'};
                            $.ajax(parameter)
                               .done(function(html, textStatus, jqXHR){
                                    var data={
                                        "method":"readArticle",
                                        "data":html
                                    };
                                    port.postMessage(data);
                               })
                               .fail(function(jqXHR, textStatus, errorThrown) {
                                    console.log(textStatus);
                                });
                            break;
                        default :
                            port.postMessage({data:[]}); // snub them.
                    }
                });
            });
        }     

    }
});
chrome.pageAction.onClicked.addListener(startShanBay());
function startShanBay(){
    var click =false;
    return function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {shanbay: click}, function(response) {
                    console.log(response);  
                });
            });
            click=!click;
            var opt={
                type: "basic",
                title: "开始",
                message: "启动扇贝单词助手",
                iconUrl: "images/logo128.png"
            }
            if(!click){
                opt.title="结束";
                opt.message="扇贝单词助手休息了~";
            }
            var notification = chrome.notifications.create(click.toString(),opt,function(notifyId){return notifyId});
            setTimeout(function(){
                chrome.notifications.clear(click.toString(),function(){});
            },5000);            
    }
}
function  testReadability(port){
    var js_url = chrome.extension.getURL('js/readability.js');
    var css1=chrome.extension.getURL('css/readability.css');
    var css2=chrome.extension.getURL('css/readability-print.css');
    port.postMessage({data:[js_url,css1,css2]});

}
//检查用户是否已经登录扇贝网
function isUserSignedOn(callback) {
    chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'sessionid'}, function (cookie) {
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
            var data={
                "method":"word",
                "data":json
            };
            console.log(data);
            port.postMessage(data);
       })
       .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        });
}
//Get All Words

function getWord(url){
    return new Promise(function(resolve, reject) {
        var parameter = {'url': url, 'dataType': 'html', type: 'GET'};
        $.ajax(parameter)
           .done(function(html, textStatus, jqXHR){
               var vocabulary_ids=$("#vocabulary_ids", html).text().trim();
               var vocab_ids=vocabulary_ids.substr(0,vocabulary_ids.length-1);
               $.ajax({'url': "http://www.shanbay.com/api/v1/bdc/learning/?vocabulary_ids="+vocab_ids+"&_="+(new Date().getTime().toString()), 'dataType': 'json', type: 'GET'})
                    .done(function(json, textStatus, jqXHR){
                        resolve(json);
                    })
                    .fail(function(jqXHR, textStatus, errorThrown){
                        reject(textStatus);
                        console.log(textStatus);
                    });
           })
           .fail(function(jqXHR, textStatus, errorThrown) {
                reject(textStatus);
                console.log(textStatus);
            });
    });
}
function getAllWord(num){
    Promise.
        all(function(){
            var array=[];
            for(var i=1;i<=num;i++){
                var url="http://www.shanbay.com/bdc/learnings/library/master?page="+i;
                 array.push(getWord(url));
            }
            console.log(array);
            return array;
        }())
        .then(function(value){
            console.log(value);
            testdata=value;
            saveAllWord(value);
        });
}
function saveAllWord(words){
    var vocabularys=[];
    for(var i=0;i<words.length;i++){
        var word=words[i].data;
        for(var j=0;j<word.length;j++){
            var vocabulary=word[j].content;
            vocabularys.push(vocabulary);
        }
    }
    localStorage.setItem("learned",JSON.stringify(vocabularys));
}
function getPageNum(){
    var parameter = {'url': 'http://www.shanbay.com/bdc/learnings/library/master', 'dataType': 'html', type: 'GET'};
    $.ajax(parameter)
       .done(function(html, textStatus, jqXHR){
            var num=$(".endless_page_link", html).eq($(".endless_page_link", html).length-2).text();
            getAllWord(num);
       })
       .fail(function(jqXHR, textStatus, errorThrown) {
            console.log(textStatus);
        });   
}

