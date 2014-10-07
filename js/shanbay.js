(function($){
    var shanbay=function(){

        return{
            startListener:function(){
                var self=this;
                $(document).on('dblclick', function () {
                    var text = window.getSelection().toString().trim().match(/^[a-zA-Z\s']+$/)
                    console.info("selected "+text);
                    if (undefined != text && null!=text&&0<text.length){
                        console.log("searching "+text);
                        var port = chrome.runtime.connect({name: "ShanBayHelper"});
                        port.postMessage({
                            method: 'lookup',
                            data: text[0]
                        });
                        port.onMessage.addListener(function(response) {
                            if(response){
                                console.log(response);
                                self.popover(response);
                            }
                        });
                        self.popover({
                            shanbay:{
                                loading:true,
                                msg:"查询中...."
                            }
                        })
                    }
                });
            },
            popover:function(data){
                var html = '<div id="shanbay_popover"><div class="popover-inner"><h3 class="popover-title">';
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
            }

        }
    }();
   shanbay.startListener();
}(jQuery));