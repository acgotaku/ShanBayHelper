(function($){
    var options=function(){
        var extension = chrome.extension.getBackgroundPage();
        return{
            init:function(){
                var self=this;
                self.checkUser();
            },
            checkUser:function(){
                var promise= extension.background.isUserSignedOn();
                promise.then(function(){
                    $("#user").text("已登录");
                },function(){
                    $("#user").text("未登录");
                });
            },
            closePopup:function(){
                window.close();
            }
        }
    }();
   options.init();
}(jQuery));