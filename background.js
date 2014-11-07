var background=function(){
    return {
        init:function(){
            var self=this;
            self.startListener();
        },
        startListener:function(){
            var self=this;
            chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
                if (changeInfo.status === 'loading') {  
                    if (!chrome.runtime.onConnect.hasListeners()) {
                        chrome.runtime.onConnect.addListener(function(port) {
                            console.log("Listener");
                            console.assert(port.name == "ShanBayHelper");
                            port.onMessage.addListener(function(request) {
                                console.log(request);
                                switch(request.method){
                                    case "getWords":
                                        var date=new Date().getTime();
                                        if(date - localStorage.getItem("update") >= 86400000){
                                            self.getWords(port);
                                        }else{
                                            var data={
                                                "method":"getWords",
                                                "data":localStorage.getItem("learned")
                                            }; 
                                            port.postMessage(data);
                                        }
                                        break;
                                    case 'lookup':
                                        self.isUserSignedOn();
                                        self.queryWord(request.data,port);
                                        break;
                                    // case 'setAction':
                                    //     if(request.show==true){
                                    //         self.article=true;
                                    //     }else{
                                    //         self.article=false;
                                    //     }
                                    //     break;
                                    case 'addWord':
                                        if(request.data){
                                            self.addNewWord(request.data,port);
                                        }
                                        break;
                                    case 'getAudio':
                                        if(request.data){
                                            var oReq = new XMLHttpRequest();
                                            oReq.open("GET", request.data, true);
                                            oReq.responseType = "blob";
                                            oReq.onload = function (oEvent) {
                                                var blob = oReq.response;
                                                var reader = new FileReader();
                                                reader.onload = function(readerEvt) {
                                                    var binaryString = readerEvt.target.result;
                                                    var testdata=btoa(binaryString);
                                                    var data={
                                                        "method":"getAudio",
                                                        "data":'data:audio/mp3;base64,'+btoa(binaryString)
                                                    };
                                                    port.postMessage(data);
                                                };
                                                reader.readAsBinaryString(blob);
                                            };

                                            oReq.send(null);                                          
                                        }
                                        break;
                                    case 'readArticle':
                                        var readerPageHTML=chrome.extension.getURL("reader.html");
                                        var readerCSS=chrome.extension.getURL("css/shanbay.css");
                                        var parameter = {'url': readerPageHTML, 'dataType': 'html', type: 'GET'};
                                        $.ajax(parameter)
                                           .done(function(html, textStatus, jqXHR){
                                                var parser = new DOMParser();
                                                // testdata=html;
                                                html = parser.parseFromString(html, "text/xml");
                                                var css=html.querySelector("link");
                                                css.setAttribute("href", readerCSS)
                                               
                                                var data={
                                                    "method":"readArticle",
                                                    "data":new XMLSerializer().serializeToString(html)
                                                };
                                                port.postMessage(data);
                                           })
                                           .fail(function(jqXHR, textStatus, errorThrown) {
                                                console.log(textStatus);
                                            });
                                        break;
                                    default :
                                        port.postMessage({data:[]}); 
                                }
                            });
                        });
                    }
                }
            });
        },
        showNotification:function(status){
            var opt={
                type: "basic",
                title: "开始",
                message: "启动扇贝单词助手",
                iconUrl: "images/logo128.png"
            }
            if(!status){
                opt.title="结束";
                opt.message="扇贝单词助手休息了~";
            }
            var notification = chrome.notifications.create(status.toString(),opt,function(notifyId){return notifyId});
            setTimeout(function(){
                chrome.notifications.clear(status.toString(),function(){});
            },5000);
        },
        isUserSignedOn:function(){
            return new Promise(function(resolve, reject){
                chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'userid'}, function (cookie) {
                    if (cookie) {
                        localStorage.setItem('shanbay_cookies', JSON.stringify(cookie));
                        resolve(cookie);
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
                        reject();
                    }
                });                
            });

        },
        queryWord:function(word,port){
            var API='http://www.shanbay.com/api/v1/bdc/search/?word=';
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
        },
        addNewWord:function(word_id,port){
            var API='http://www.shanbay.com/api/v1/bdc/learning/';
            var parameter = {'url': API, 'dataType': 'json', type: 'POST',contentType: "application/json; charset=utf-8",data:JSON.stringify({
                content_type: "vocabulary",
                id: word_id
                })};
            $.ajax(parameter)
               .done(function(json, textStatus, jqXHR){
                    var data={
                        "method":"addWord",
                        "data":json
                    };
                    console.log(data);
                    port.postMessage(data);
               })
               .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                });
        },
        sendData:function(data){
            console.log("sendData");
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
                    console.log(response);  
                });
            });
        },
        openOptions:function(firstTime){
            var url = "options.html";
            if (firstTime)
                url += "?firstTime=true";

            var fullUrl = chrome.extension.getURL(url);
            chrome.tabs.getAllInWindow(null, function (tabs) {
                for (var i in tabs) { // check if Options page is open already
                    if (tabs.hasOwnProperty(i)) {
                        var tab = tabs[i];
                        if (tab.url == fullUrl) {
                            chrome.tabs.update(tab.id, { selected:true }); // select the tab
                            return;
                        }
                    }
                }
                chrome.tabs.getSelected(null, function (tab) { // open a new tab next to currently selected tab
                    chrome.tabs.create({
                        url:url,
                        index:tab.index + 1
                    });
                });
            });
        },
        getWords:function(port){
            var parameter = {'url': 'http://www.shanbay.com/bdc/learnings/library/master', 'dataType': 'html', type: 'GET'};
            $.ajax(parameter)
               .done(function(html, textStatus, jqXHR){
                    var num=$(".endless_page_link", html).eq($(".endless_page_link", html).length-2).text();
                    getAllWord(num);
               })
               .fail(function(jqXHR, textStatus, errorThrown) {
                    console.log(textStatus);
                });

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
                        saveAllWord(value);
                    });
            }
            function saveAllWord(words){
                var vocabularys={};
                for(var i=0;i<words.length;i++){
                    var word=words[i].data;
                    for(var j=0;j<word.length;j++){
                        var vocabulary=word[j].content;
                        vocabularys[vocabulary]=1;
                    }
                }
                localStorage.setItem("learned",JSON.stringify(vocabularys));
                localStorage.setItem("update",new Date().getTime());
                var data={
                "method":"getWords",
                "data":JSON.stringify(vocabularys)
                }; 
                console.log(data);
                if(port){
                    port.postMessage(data);
                }
            }
        }
    }
}();
background.init();