var background=function(){
    return {
        init:function(){
            var self=this;
            self.startListener();

        },
        startListener:function(){
            var self=this;
            if (!chrome.runtime.onConnect.hasListeners()) {
                chrome.runtime.onConnect.addListener(function(port) {
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
                            case 'setAction':
                                if(request.show==true){
                                    console.log(port);
                                    chrome.pageAction.show(port.sender.tab.id);
                                    chrome.pageAction.onClicked.addListener(self.clickIcon(port));  
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
                                port.postMessage({data:[]}); 
                        }
                    });
                });
            }
        },
        isUserSignedOn:function(){
            chrome.cookies.get({"url": 'http://www.shanbay.com', "name": 'sessionid'}, function (cookie) {
                if (cookie) {
                    localStorage.setItem('shanbay_cookies', JSON.stringify(cookie));
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
        },
        queryWord:function(word,port){
            var API='https://api.shanbay.com/bdc/search/?word=';
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
        clickIcon:function(){
            var click =false;
            return function(){
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                var data={
                    "method":"clickIcon",
                    "data":click
                };
                chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
                    console.log(response);  
                });
            }); 
            click=!click;
            }
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
                port.postMessage(data);
            }
        }
    }
}();
background.init();