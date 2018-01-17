var curr_ev = null
var prev_x = -400
var prev_y = -400
var fr_x = 0
var to_x = 0
var should_update = false

var first_time = true
var time_one = true
var escapeChars = {
   "&": "&amp;",
   "<": "&lt;",
   ">": "&gt;",
 };

var curr = ""

jQuery.fn.exists = function(){ return this.length > 0; }

$("body").append("<div id = \"apertium-popup-translate\" class = \"apertium-popup-translate\"> <div id = \"apertium-popup-translate-text\" class = \"apertium-popup-translate-text\"> </div>")

function real_movement(prex, prey, postx, posty) {
    if (Math.sqrt(Math.pow(prex-postx, 2) + Math.pow(prey-posty, 2)) >= 7) {
        return true;
    }
    return false;
}

function strip_leading_non_word_chars(s) {
    var desired_txt = XRegExp.replace(s,(XRegExp("^\\P{L}+")),"");
    desired_txt = XRegExp.replace(desired_txt,(XRegExp("\\P{L}+$")),"");
    return desired_txt;
}

$(document).mousemove(function(event) {
    if ((curr_ev) && (real_movement(prev_x, prev_y, event.pageX - window.pageXOffset, curr_ev.pageY - window.pageYOffset))) {
        $(".apertium-popup-translate").css("display","none")
        should_update = true
    }
    curr_ev = event
});

function mouse_hover() {
    if (curr_ev) {
        prev_x = curr_ev.pageX - window.pageXOffset
        prev_y = curr_ev.pageY - window.pageYOffset

        var elem = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset));

        var nodes = elem.contents().filter(function(){
            return ((this.nodeType == Node.TEXT_NODE) && !($(this).text().match(/\A\s*\z/)))
        });

        $(nodes).wrap('<apertiumproblocation />');

        if (nodes.length == 0) {
            $(nodes).unwrap();
        } else {
            var text = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
            if (text.nodeName == 'APERTIUMPROBLOCATION') {
                $(nodes).unwrap();
                var txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var prev_txt = document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset);
                var orig_text = $(txt).html();

                txt = $(txt).contents().filter(function(){
                    return this.nodeType == Node.TEXT_NODE && !($(this).text().match(/\A\s*\z/))
                });

                $.each(txt, function(inx, words) {
                    var wordarr = $(words).text().split(/([\s-;.])/g)
                    var dest_str = ""
                    $.each(wordarr, function(inx, atext) {
                        dest_str = dest_str + "<apertiumword>" + htmlEscape(atext) + "</apertiumword>"
                    });
                    $(words).replaceWith(dest_str)

                });



                $(".apertium-popup-translate-text").empty()

                var disp_txt_node = $(document.elementFromPoint((curr_ev.pageX - window.pageXOffset), curr_ev.pageY - window.pageYOffset))

                $(prev_txt).empty()
                $(prev_txt).append(orig_text)
                uri = browser.storage.sync.get("apertiumapiuri")
                from = browser.storage.sync.get("fromlang")
                to = browser.storage.sync.get("tolang")
                var disp_txt;
                to.then((res)=>{
                  from.then((res_one)=>{
                    uri.then((res_two)=>{
                        if (res_two.apertiumapiuri) {
                            if (res_one.fromlang && res.tolang) {
                                disp_txt = translate_text(res_two.apertiumapiuri, disp_txt_node, (res_one.fromlang+"-"+res.tolang))
                                console.log(disp_txt)
                            } else {
                                //Globalize!!
                                disp_txt = "Please click the dropdowns and reselect a pair."
                            }
                        } else {
                            if (res_one.fromlang && res.tolang) {
                                disp_txt = translate_text("http://beta.apertium.org/apy/", disp_txt_node, (res_one.fromlang+"-"+res.tolang))

                            } else {
                                //Globalize!!
                                disp_txt = "Please click the dropdowns and reselect a pair."
                            }
                        }
                        if(disp_txt == undefined){
                          disp_txt = "Oops... Something seems to have gone wrong with the API"
                        }
                        if(shouldShow(disp_txt)) {
                            $(".apertium-popup-translate-text").append(disp_txt)
                            $(".apertium-popup-translate").css("display","table")
                            var y_offset = 15
                            if ((curr_ev.pageY - window.pageYOffset + 40 + $(".apertium-popup-translate-text").outerHeight()) > $(window).height()) {
                                y_offset = -40
                            }

                            var x_offset = 20

                            if ((curr_ev.pageX + 70 + $(".apertium-popup-translate-text").outerWidth()) > $(window).width()) {
                                x_offset = -$(".apertium-popup-translate-text").outerWidth() + 20 - 60
                            }

                            if ((curr_ev.pageX + x_offset) < 0) {
                                $(".apertium-popup-translate").css("left","5px")
                            } else {
                                $(".apertium-popup-translate").css("left",((curr_ev.pageX + x_offset).toString() + "px"))
                            }

                            if ((curr_ev.pageY + y_offset) < 0) {
                                $(".apertium-popup-translate").css("top","5px")
                            } else {
                                $(".apertium-popup-translate").css("top",((curr_ev.pageY + y_offset).toString() + "px"))
                            }
                        }
                      })
                    })
                  })

                // disp_txt = XRegExp.replace(disp_txt, new XRegExp("\\P{L}+", "g"), "")
            } else {
                $(nodes).unwrap();
            }
        }
    }
}

function translate_text(apy_url, txt_node, lang_pair) {
    try{
      var ctx_counter = 0
      var ctx_pos = 1
      var desired_txt = strip_leading_non_word_chars(txt_node.text().trim())
      var curr_node = txt_node
      var txt = txt_node.text()
      while ((ctx_counter < 14) && (curr_node.prev().length != 0)) {
          txt = curr_node.prev().text() + txt
          if(XRegExp("\\p{L}").test(curr_node.prev().text())) {
              ctx_counter = ctx_counter + 1
              if(desired_txt == strip_leading_non_word_chars(curr_node.prev().text().trim())) {
                  ctx_pos = ctx_pos + 1
              }
          }
          curr_node = curr_node.prev()

      }

      ctx_counter = 0

      while ((ctx_counter < 14) && (curr_node.next().length != 0)) {
          txt = txt + curr_node.next().text()
          if(XRegExp("\\p{L}").test(curr_node.next().text())) {
              ctx_counter = ctx_counter + 1
          }
          curr_node = curr_node.next()
      }

      txt = XRegExp.replace(txt,XRegExp("\\s"),"+")
      var reqUrl = encodeSemicolon(URI.decode(URI(apy_url) + URI("perWord").addQuery("lang",lang_pair).addQuery("modes","biltrans").addQuery("q",txt)))

      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open( "GET", encodeURI(reqUrl), false );
      xmlHttp.send(null);

      var lang_arr = JSON.parse(xmlHttp.responseText);
      var first_time = true
      //Globalize!!
      var translated_txt = "Sorry, we cannot translate \"" + desired_txt + "\""
      var translate_dict = {}
      $.each(lang_arr, function(inx, trans_obj) {
          if(trans_obj.input == desired_txt) {
              if(ctx_pos == 1) {
                  $.each(trans_obj.biltrans, function(inx, btransobj) {
                      if(actualEntry(htmlEscape(btransobj))){
                          word_tags = getTags(btransobj)

                          if(stripTags(htmlEscape(btransobj)) in translate_dict) {
                              translate_dict[stripTags(htmlEscape(btransobj))].push(word_tags)
                          } else {
                              translate_dict[stripTags(htmlEscape(btransobj))] = [word_tags]
                          }
                      }
                  })
                  return false;
              } else {
                  ctx_pos = ctx_pos - 1;
              }
          }
      });

      if ((Object.keys(translate_dict).length) > 0) {
          $.each(Object.keys(translate_dict), function(inx_main, trans_dict_key){
              $.each(translate_dict[trans_dict_key], function(inx, trans_dict_vals) {
                  var tags_str = ""
                  $.each(trans_dict_vals, function(inx, word_tag) {
                      tags_str += word_tag
                      if (inx < (trans_dict_vals.length - 1)) {
                          tags_str += ", "
                      }
                  })

                  if((inx_main == 0) && (inx == 0)) {
                      translated_txt = "<b>" + desired_txt + "</b><ul><li>" + trans_dict_key
                      translated_txt += "<ul> <li>" + tags_str
                  } else if (inx == 0) {
                      translated_txt += "<li>" + trans_dict_key
                      translated_txt += "<ul> <li>" + tags_str
                  }

                  if(tags_str != "") {
                      if(inx != 0) {
                          translated_txt += "<li>" + tags_str
                      }

                      if(inx == translate_dict[trans_dict_key].length-1) {
                          translated_txt += "</ul>"
                      }

                  } else if (inx == translate_dict[trans_dict_key].length-1){
                      translated_txt += "</ul>"
                  }
              })
          })

      }

      return (translated_txt + "</ul>")



    }catch(err){
      console.log(err)
      console.log("It looks like an end point isn't working or the link is incorrect.")
    }
}


try{
  $(document).mousestop(function() {
      if(should_update){
          chrome.storage.sync.get("apertium-enabled", function(items) {
              if(items["apertium-enabled"]) {
                  if(items["apertium-enabled"] == "On") {
                      mouse_hover()
                  }
              } else {
                  chrome.storage.sync.set({'apertium-enabled': "On"}, function() {
                      mouse_hover()
                  });
              }
          });
          should_update = false
      }
  });
}catch(TypeError){
  console.log("Something went wrong with the hovering")
}


function htmlEscape(string) {
    return String(string).replace(/[&<>]/g, function (s) {
      return escapeChars[s];
    });
  }

function encodeSemicolon(string) {
    return String(string.replace(/;/g), "%3B")
}

function getTags(string) {
    regex = /<(.*?)>/g
    word_tags = []
    tag_match = regex.exec(string)
    if(tag_match) {
        word_tags.push(tag_match[1])
    }
    while(tag_match) {
        tag_match = regex.exec(string)
        if(tag_match) {
            word_tags.push(tag_match[1])
        }
    }
    return word_tags
}

function stripTags(string){
    return String(string.replace(/&lt;.*$/, ""))
}
//I think this works ... Someone should check this logic against the format of the APY.
function actualEntry(string) {
    if (XRegExp.test(string.trim(), XRegExp("[@*]\\p{L}"))) {
        return false;
    } else {
        return true;
    }
}

function shouldShow(string) {
    return XRegExp.test(string.trim(), XRegExp("\\p{L}"))
    //return true
}

function translates(word, lang_pair, textContent, children, url){

  try {
    var reqUrl = encodeSemicolon(URI.decode(URI(url) + URI("translate").addQuery("langpair",lang_pair).addQuery("q",word)))
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          var lang_arr = JSON.parse(xmlHttp.responseText);
          textContent.textContent = textContent.textContent.replace(word, lang_arr["responseData"]["translatedText"])
        } else {
          console.error(xmlHttp.statusText);
        }
      }
    };

    xmlHttp.open("GET", encodeURI(reqUrl), true);

    xmlHttp.send()

  } catch(e){
    console.log(e)
  }
}



chrome.runtime.onMessage.addListener(function(request){
  uri = browser.storage.sync.get("apertiumapiuri")
  from = browser.storage.sync.get("fromlang")
  to = browser.storage.sync.get("tolang")
  to.then((res)=>{
    from.then((res_one)=>{
      uri.then((res_two)=>{
        var elements = document.querySelectorAll("span, p, li, br, h1, h2, h3, h4, b, legend");
        for(var i = 0; i < elements.length; i++) {
           var current = elements[i];
           var children = current.childNodes;
           if(isAlphanumeric(current.textContent)){
             if(res_two.apertiumapiuri != null){
               translates(current.textContent, (res_one.fromlang+"|"+res.tolang), current, children, res_two.apertiumapiuri)
             }else{
               translates(current.textContent, (res_one.fromlang+"|"+res.tolang), current, children, "http://beta.apertium.org")
             }
           }
         }
      })
    })
  })
})

function isAlphanumeric( str ) {
 return /^[^{}$%»×]+$/.test(str);
 // return true
}

$(document).ready(function() {
})
