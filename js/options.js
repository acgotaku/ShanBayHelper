(function($){
    var options=function(){
        var extension = chrome.extension.getBackgroundPage();
        return{
            init:function(){
                var self=this;
                self.checkUser();
                self.checkWords();
                self.checkUpdateTime();
            },
            checkUser:function(){
                var promise= extension.background.isUserSignedOn();
                promise.then(function(){
                    $("#user").text("已登录");
                },function(){
                    $("#user").text("未登录");
                });
            },
            checkWords:function(){
                var words=JSON.parse(extension.localStorage.getItem("learned"));
                if(words){
                    var length=Object.keys(words).length;
                    console.log(length);
                    $("#count").text(length);                    
                }
            },
            checkUpdateTime:function(){
                var time=JSON.parse(extension.localStorage.getItem("update"));
                var date=new Date(time);
                $("#time").text(date.toLocaleDateString() + date.toLocaleTimeString());
                $("#update").on("click",function(){
                    extension.background.getWords();
                    alert("更新已经启动,稍后刷新页面即可.");
                });
            },
            closePopup:function(){
                window.close();
            }
        }
    }();
   options.init();
}(jQuery));