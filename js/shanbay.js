var shanbay=function(){
    var port = chrome.runtime.connect({name: "ShanBayHelper"});
    return{
        init:function(){
            var self=this;
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
                        case "addWord":
                            var iframe=document.getElementById("shanbay_content");
                            if(iframe){
                                self.addWord(response.data,iframe.contentDocument);
                            }else{
                                self.addWord(response.data);
                            }
                            break;
						case "forget":
							var iframe=document.getElementById("shanbay_content");
                            if(iframe){
                                self.forget(response.data,iframe.contentDocument);
                            }else{
                                self.forget(response.data);
                            }
							break;
                        case "getAudio":
                            if(response.data){
                                var audio_url=response.data;
                                // var audio_url='data:audio/mp3;base64,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8/DmtbFXUypTrH8rH/////a+TTUUb+ht8jWWOdzVllrKGBggYQPZZYNP5ZZLLLLJZZZYyhgYIGCDggQMEDBOjpKRk1lVrLHS//M4xOwYwnp0AMARDNjkatZKysDBAwQK00gYhYJppqJVRK6aaaf/+V00003//hAxKqqmmkDMWS0w1UxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//M4xOgWKtocAHhQ2VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUxBTUUzLjk5LjNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//M4xO4XEd0EABhHAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//M4xKAAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
                                if(audio_url) {
                                    new Howl({
                                        urls: [audio_url]
                                    }).play();
                                }                                 
                            }
                            break;                    
                        default :
                            console.log(response);
                    }
                }
            });
            chrome.runtime.onMessage.addListener(
                function(response, sender, sendResponse) {
                    console.log(response);
                    switch(response.method){
                        case "startListener":
                            self.startListener(response.data);
                            break;
                        case "readArticle":
                            port.postMessage({
                                method: 'readArticle',
                                data: true
                            });
                            break;
                    }
                        // sendResponse({shanbay: request});
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
            }else{
                if(data.status_code==0){
                    if(data.data.learning_id != undefined){
                        html += '<p><span class="word">'+data.data.content+'</span>'
                            +'<span class="pronunciation">'+(data.data.pron.length ? ' ['+data.data.pron+'] ': '')+'</span></p>'
                            +'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
                            +'<div class="popover-content">'
                            +'<p>'+data.data.definition.split('\n').join("<br/>")+'</p>'
							+'<div class="add-btn"><a href="#" class="btn" id="shanbay-forget-btn">忘记了</a>'
							+'<p class="success hide">已添加到今天的复习计划</p>'
							+'<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a></div>'
                            +'</div>';
                    }else{
                        html += '<p><span class="word">'+data.data.content+'</span>'
                            +'<small class="pronunciation">'+(data.data.pron.length ? ' ['+data.data.pron+'] ': '')+'</small></p>'
                            +'<a href="#" class="speak uk">UK<i class="icon icon-speak"></i></a><a href="#" class="speak us">US<i class="icon icon-speak"></i></a></h3>'
                            +'<div class="popover-content">'
                            +'<p>'+data.data.definition.split('\n').join("<br/>")+'</p>'
                            +'<div class="add-btn"><a href="#" class="btn" id="shanbay-add-btn">添加生词</a>'
                            +'<p class="success hide">成功添加！</p>'
                            +'<a href="#" target="_blank" class="btn hide" id="shanbay-check-btn">查看</a></div>'
                            +'</div>';
                        }
                }else{
                    console.log(data);
                    html += '未找到单词</h3></div>';
                }                
            }


            html += '</div></div>'
            $('#shanbay_popover',content).remove()
            $(content.body).append(html);

            getSelectionOffset(function(left, top) {
                setPopoverPosition(left, top);
            });
            $('#shanbay-add-btn').click(function(e) {
                e.preventDefault();
                addNewWord(data.data.id);
            });
			$('#shanbay-forget-btn').click(function(e) {
                e.preventDefault();
                forgetWord(data.data.learning_id);
            });
            $('#shanbay_popover .speak.us',content).click(function(e) {
                e.preventDefault();
                var audio_url = data.data.audio_addresses.us[0];//'http://media.shanbay.com/audio/us/' + data.data.content + '.mp3';
                port.postMessage({
                    method: 'getAudio',
                    data: audio_url
                });
                // playAudio(audio_url);
            });

            $('#shanbay_popover .speak.uk',content).click(function(e) {
                e.preventDefault();
                var audio_url = data.data.audio_addresses.uk[0];//'http://media.shanbay.com/audio/uk/' + data.data.content + '.mp3';
                port.postMessage({
                    method: 'getAudio',
                    data: audio_url
                });
                // playAudio(audio_url);
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
            function addNewWord(word_id) {
                port.postMessage({
                    method: 'addWord',
                    data: word_id
                });
            }
			
			function forgetWord(learning_id) {
				port.postMessage({
                    method: 'forget',
                    data: learning_id
                });
			}

            // function playAudio(audio_url) {
            //     if(audio_url) {
            //         new Howl({
            //             urls: [audio_url]
            //         }).play();
            //     }
            // }
        },
        addWord:function(data,content){
            content = content ? content : document;
            console.log(data);
            switch(data.msg){
              case "SUCCESS":
                  $('#shanbay-add-btn',content).addClass('hide');
                  $('#shanbay_popover .success, #shanbay-check-btn',content).removeClass('hide');
                  $('#shanbay-check-btn',content).attr('href', 'http://www.shanbay.com/review/learning/' + data.data.id);
                    break;
              case "ERROR":
                $('#shanbay_popover .success',content).text('添加失败，请重试。').removeClass().addClass('failed');
                break;
              default:
              console.log(data);
            };
        },
		forget:function(data,content){
            content = content ? content : document;
            console.log(data);
            switch(data.msg){
              case "SUCCESS":
                  $('#shanbay-forget-btn',content).addClass('hide');
                  $('#shanbay_popover .success, #shanbay-check-btn',content).removeClass('hide');
                  $('#shanbay-check-btn',content).attr('href', 'http://www.shanbay.com/review/learning/' + data.data.id);
                    break;
              case "ERROR":
                $('#shanbay_popover .success',content).text('操作失败，请重试。').removeClass().addClass('failed');
                break;
              default:
              console.log(data);
            };
        },
        readArticle:function(html){
            console.log("readArticle");
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
