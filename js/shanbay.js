(function($){
    var shanbay=function(){

        return{
            init:function(){
                var self=this;
                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                            self.startListener(request.shanbay);
                            console.log(request);
                            sendResponse({shanbay: request});
                        });
            },
            startListener:function(status){
                var self=this;
                var port = chrome.runtime.connect({name: "ShanBayHelper"});
                port.postMessage({
                    method: 'readArticle',
                    data: true
                });
                port.onMessage.addListener(function(response) {
                    if(response){
                        console.log(response);
                        switch(response.method){
                            case "word":
                                self.popover(response.data);
                                break;
                            case "readArticle":
                                self.readArticle(response.data);
                                break;
                            default :
                                console.log(response);
                        }
                       // var script = document.createElement('script');
                       // script.src = response[0];
                       // document.head.appendChild(script);
                       // var link = document.createElement('link');
                       // link.href = response[1];
                       // link.setAttribute('type', 'text/css');
                       // document.head.appendChild(link);
                       // link.href = response[2];
                       // link.setAttribute('type', 'text/css');
                       // document.head.appendChild(link);
                    }
                });
                console.log(status);
                if(!status){
                    $(document).unbind( "dblclick" );
                    return ;
                }
                $(document).on('dblclick', function () {
                    var text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/)
                    console.info("selected "+text);
                    if (undefined != text && null!=text&&0<text.length){
                        console.log("searching "+text);
                        self.popover(
                            {
                                loading:true,
                                msg:"查询中...."
                            }
                        )
                        port.postMessage({
                            method: 'lookup',
                            data: text[0]
                        });

                    }
                });
            },
            popover:function(data){
                var html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';
                if(true == data.loading){
                    html += '<p><span class="word">'+data.msg+'</span></p>';
                }
                if(data.status_code==0){
                    html += '<p><span class="word">'+data.data.content+'</span>'
                        +'<span class="pronunciation">'+(data.data.pron.length ? ' ['+data.data.pron+'] ': '')+'</span></p>'
                        +'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
                        +'<div class="popover-content">'
                        +'<p>'+data.data.definition.split('\n').join("<br/>")+'</p>'
                        +'</div>';
                }

                html += '</div></div>'
                $('#shanbay_popover').remove()
                $('body').append(html);

                getSelectionOffset(function(left, top) {
                    setPopoverPosition(left, top);
                });

                $('#shanbay_popover .speak.us').click(function(e) {
                    e.preventDefault();
                    var audio_url = 'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
                    playAudio(audio_url);
                });

                $('#shanbay_popover .speak.uk').click(function(e) {
                    e.preventDefault();
                    var audio_url = 'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
                    playAudio(audio_url);
                });

                $('html').click(function() {
                  $('#shanbay_popover').remove();
                });
                $('body').on('click', '#shanbay_popover', function (e) {
                  e.stopPropagation();
                });
                function getSelectionOffset(callback) {
                  var left = window.innerWidth/2;
                  var top = window.innerHeight/2;
                  var selection = window.getSelection();
                  if(0<selection.rangeCount){
                    var range = window.getSelection().getRangeAt(0);
                    var dummy = document.createElement('span');
                    range.insertNode(dummy);
                    left = getLeft(dummy) - 50;
                    top = getTop(dummy) + 25;
                    dummy.remove();
                    window.getSelection().addRange(range);
                  }
                    console.log(left + ':' + top);
                    callback(left, top);
                }
                function getTop(e){
                    var offset=e.offsetTop;
                    if(e.offsetParent!=null) offset+=getTop(e.offsetParent);
                    return offset;
                }

                function getLeft(e){
                    var offset=e.offsetLeft;
                    if(e.offsetParent!=null) offset+=getLeft(e.offsetParent);
                    return offset;
                }

                function setPopoverPosition(left, top) {
                    $('#shanbay_popover').css({
                        position: 'absolute',
                        left: left,
                        top: top
                    });
                }
                function playAudio(audio_url) {
                    if(audio_url) {
                        new Howl({
                            urls: [audio_url]
                        }).play();
                    }
                }
            },
            readArticle:function(html){
                var wrap = document.createElement("iframe");
                wrap.style.cssText = cssUp({
                    position: "fixed",
                    left: "0",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    width: "100%",
                    height: "100%",
                    border: "none",
                    "background-color": "rgba(0, 0, 0, 0.8 )",
                    "z-index": "999998",
                    cursor: "default",
                    "float": "none",
                    margin: "0px",
                    padding: "0px",
                    opacity: "1",
                    "-webkit-transition": "opacity 0.4s"
                }, true);
                var content = document.createElement("iframe");
                content.style.cssText = cssUp({
                    position: "fixed",
                    left: "0",
                    top: "0",
                    right: "0",
                    bottom: "0",
                    width: "100%",
                    height: "100%",
                    border: "none",
                    "background-color": "rgba(0, 0, 0, 0.0)",
                    "z-index": "999999",
                    color: "#000",
                    cursor: "default",
                    "float": "none",
                    "letter-spacing": "normal",
                    "line-height": "normal",
                    "text-align": "left",
                    "text-decoration": "none",
                    "white-space": "normal",
                    "word-spacing": "normal",
                    margin: "0px",
                    padding: "0px",
                    direction: "ltr"
                }, true);
                document.body.appendChild(wrap);
                document.body.appendChild(content);
                var article = content.contentDocument;
                article.open();
                article.write(html);
                article.close();
                function cssUp(object, value) {
                    var temp = "";
                    for (key in object) temp += key + ": " + object[key] + (value ? " !important; " : "; ");
                    return temp;
                }

            }

        }
    }();
   shanbay.init();
}(jQuery));