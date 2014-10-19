(function($){
    var shanbay=function(){
        var port = chrome.runtime.connect({name: "ShanBayHelper"});
        return{
            init:function(){
                var self=this;
                self.startListener(true);
                port.onMessage.addListener(function(response) {
                    if(response){
                        console.log(response);
                        switch(response.method){
                            case "word":
                                var iframe=document.getElementById("shanbay_content");
                                if(iframe){
                                    self.popover(response.data,iframe.contentDocument);
                                }else{
                                    self.popover(response.data);
                                }
                                break;
                            case "readArticle":
                                self.readArticle(response.data);
                                break;
                            case "getWords":
                                setTimeout(function(){
                                    self.parseArticle(response.data);
                                },2); 
                                break;
                            default :
                                console.log(response);
                        }
                    }
                });
                chrome.runtime.onMessage.addListener(
                    function(request, sender, sendResponse) {
                            port.postMessage({
                                method: 'readArticle',
                                data: true
                            });
                            sendResponse({shanbay: request});
                        });
            },
            startListener:function(status,content){
                var self=this;
                content = content ? content : document;
                if(!status){
                    $(content).unbind( "dblclick" );
                    return ;
                }
                $(content).on('dblclick', function () {
                    var text = content.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/);
                    console.info("selected "+text);
                    if (undefined != text && null!=text&&0<text.length){
                        console.log("searching "+text);
                        self.popover(
                            {
                                loading:true,
                                msg:"查询中...."
                            },content
                        );
                        port.postMessage({
                            method: 'lookup',
                            data: text[0]
                        });

                    }
                });
            },
            popover:function(data,content){
                content = content ? content : document;
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
                $('#shanbay_popover',content).remove()
                $(content.body).append(html);

                getSelectionOffset(function(left, top) {
                    setPopoverPosition(left, top);
                });

                $('#shanbay_popover .speak.us',content).click(function(e) {
                    e.preventDefault();
                    var audio_url = 'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
                    playAudio(audio_url);
                });

                $('#shanbay_popover .speak.uk',content).click(function(e) {
                    e.preventDefault();
                    var audio_url = 'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
                    playAudio(audio_url);
                });

                $(content.body).click(function() {
                  $('#shanbay_popover',content).remove();
                });
                $('#shanbay_popover',content).click(function(e){
                    e.stopPropagation();
                });
                function getSelectionOffset(callback) {
                  var left = content.innerWidth/2;
                  var top = content.innerHeight/2;
                  var selection = content.getSelection();
                  if(0<selection.rangeCount){
                    var range = content.getSelection().getRangeAt(0);
                    var dummy = content.createElement('span');
                    range.insertNode(dummy);
                    left = getLeft(dummy) - 50;
                    top = getTop(dummy) + 25;
                    dummy.remove();
                    content.getSelection().addRange(range);
                  }
                    console.log(left + ':' + top);
                    var article=content.getElementById("articleContainer");
                    if(article){
                        top=top-article.scrollTop;
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
                    $('#shanbay_popover',content).css({
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
                var self=this;
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
                content.setAttribute("id","shanbay_content");
                document.body.appendChild(wrap);
                document.body.appendChild(content);
                var article = content.contentDocument;
                article.open();
                article.write(html);
                article.close();
                article.getElementById("title").innerText=readability.getArticleTitle().innerHTML;
                article.getElementsByClassName("content")[0].innerHTML=readability.grabArticle().innerHTML;
                article.getElementById("article").onclick=function(e){
                    var shanbay_popover=article.getElementById("shanbay_popover");
                    if(shanbay_popover){
                        shanbay_popover.remove();
                    }
                    e.stopPropagation();
                };
                article.body.onclick=function(){
                    document.body.removeChild(wrap);
                    document.body.removeChild(content);
                };
                self.startListener(true,article);
                port.postMessage({
                    method: 'getWords',
                    data: "shanbay"
                });
                function cssUp(object, value) {
                    var temp = "";
                    for (key in object) temp += key + ": " + object[key] + (value ? " !important; " : "; ");
                    return temp;
                }

            },
            parseArticle:function(words){
                var words=JSON.parse(words);
                var iframe=document.getElementById("shanbay_content");
                var article = iframe.contentDocument;
                var content=readability.grabArticle();
                var html=content.innerHTML;
                var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
                html=html.replace(SCRIPT_REGEX,"");
                html=html.replace(/<!--.*?-->/g, "");
                content.innerHTML=html;
                text=html.replace(/(<([^>]+)>)/ig,"");       
                text=text.replace(/[\.,-\/#!$%\^&\*’”;:{}=\-_`~()]/g,"");
                var texts=text.split(" ");
                var object={};
                for(var i=0;i<texts.length;i++){
                    var single=texts[i].toString().trim().match(/^[a-zA-Z\s']+$/);
                    if(single){
                        object[single]=1;
                    }    
                }
                console.log("replace");
                var arrays=Object.keys(object);
                var children = content.firstChild.firstChild.children;
                var place_text=[];
                for(var j=0; j<children.length; j++) {
                    place_text.push(children[j].innerText);
                }
                for(var i=0;i<arrays.length;i++){
                    var single=arrays[i].toLowerCase();
                    if(words.hasOwnProperty(single)){
                        var find = new RegExp('\\b'+arrays[i]+'\\b','g');
                        //console.log(arrays[i]);
                        for(var j=0; j<place_text.length; j++) {
                            if(place_text[j].indexOf(arrays[i]) > -1){
                                place_text[j]=place_text[j].replace(find,'<span class="learned">'+ arrays[i] +'</span>');
                                //console.log(place_text[j]);
                            }
                        }
                    }
                    // if(i>13){
                    //     article.getElementsByClassName("content")[0].innerHTML=content.innerHTML;
                    //     return;
                    // }
                }
                for(var j=0; j<children.length; j++) {
                    children[j].innerHTML=place_text[j];
                }
               // console.log(content.innerHTML);
               article.getElementsByClassName("content")[0].innerHTML=content.innerHTML;
            }

        }
    }();
   shanbay.init();
}(jQuery));