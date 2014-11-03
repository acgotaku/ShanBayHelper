(function($){
    var popup=function(){
        var extension = chrome.extension.getBackgroundPage();
        return{
            init:function(){
                var self=this;
                self.startListener();
                self.sendData({method:"IsArticle"});
            },
            startListener:function(){
                var self=this;
                $("#lookup").on("click",function(){
                    self.closePopup();
                    var data={
                        method: 'startListener',
                        data: true
                    };
                    extension.background.sendData(data);
                    extension.background.showNotification(true);
                });
                $("#readArticle").on("click",function(){
                    self.closePopup();
                    var data={
                        method: 'readArticle',
                        data: true
                    };
                    extension.background.sendData(data);                 
                });
                $("#endup").on("click",function(){
                    self.closePopup();
                    var data={
                        method: 'startListener',
                        data: false
                    };
                    extension.background.sendData(data);  
                    extension.background.showNotification(false);                  
                });
                $("#options").on("click",function(){
                    self.closePopup();   
                    extension.background.openOptions();               
                });
            },
            closePopup:function(){
                window.close();
            },
            sendData:function(data){
                console.log("IsArticle");
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, data, function(response) {
                        console.log(response);
                        switch(response.method){
                            case "IsArticle":
                                if(response.data==false){
                                    $("#readArticle").hide();
                                }
                                break;
                        } 
                    });
                });
            }
        }
    }();
   popup.init();
}(jQuery));