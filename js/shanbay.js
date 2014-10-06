(function($){
    $(document).on('dblclick', function () {
        var text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/)
        console.info("selected "+text)
        if (undefined != text && null!=text&&0<text.length){
            console.log("searching "+text)
            chrome.extension.sendMessage({
                method: 'lookup',
                action: 'lookup',
                data: text[0]
            },function(resp){
                console.log(resp.data)
            });
            popover({
                shanbay:{
                    loading:true,
                    msg:"查询中...."
                }
            })
        }
    });
	
}(jQuery));