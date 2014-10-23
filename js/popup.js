(function($){
    var popup=function(){
        var extension = chrome.extension.getBackgroundPage();
        return{
            init:function(){
                var self=this;
                self.startListener();
                console.log(extension.article);
                if(!extension.article){
                     $("#readArticle").hide();
                }
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
            },
            closePopup:function(){
                window.close();
            }
        }
    }();
   popup.init();
}(jQuery));