var alllangs = {}
var locales = {}



function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()
    if((fr_lang != "emptylang") && (to_lang != "emptylang")){
        // chrome.storage.sync.set({'fr-lang': fr_lang, 'to-lang': to_lang}, function() {
        //     alert_msg = "Success! Reload pages for changes to take effect."
        //     $("#to-lang option[value='emptylang']").remove();
        //     $("#from-lang option[value='emptylang']").remove();
        //
        // });
        browser.storage.sync.set({fr-lang: fr_lang, to-lang: to_lang}}
        alert_msg = "Success! Reload pages for changes to take effect."
        $("#to-lang option[value='emptylang']").remove();
        $("#from-lang option[value='emptylang']").remove();

    }
}

function restore_options() {
    chrome.storage.sync.get(["fr-lang", "to-lang"], function(items) {
        console.log(items["fr-lang"])
        if (items["fr-lang"] && items["to-lang"]) {
            $("#from-lang").val(items["fr-lang"])
            update_selectboxes()
            $("#to-lang").val(items["to-lang"])
        } else {
            $("#from-lang").prepend("<option value=\"emptylang\"></option>")
            $("#from-lang").val("emptylang")
            $("#to-lang").prepend("<option value=\"emptylang\"></option>")
            $("#to-lang").val("emptylang")
        }
    });
}

function download_langs_with_uri(api_uri) {
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", URI(api_uri) + URI("listPairs"), true);
    xmlHttp.send(null);
    xmlHttp.onload = function (e) {
      if (xmlHttp.readyState === 4) {
        if (xmlHttp.status === 200) {
          var langs = JSON.parse(xmlHttp.responseText);
          langs = langs["responseData"]
          var lang_codes = []
          $.each(langs, function(inx, rd){
              if (rd["sourceLanguage"] in alllangs) {
                  alllangs[rd["sourceLanguage"]].push(rd["targetLanguage"])
              } else {
                  alllangs[rd["sourceLanguage"]] = [rd["targetLanguage"]]
              }
              lang_codes.push(rd["sourceLanguage"])
              lang_codes.push(rd["targetLanguage"])
          });
          var codesstr = ""
          $.each(lang_codes, function(inx, code){
              codesstr = codesstr + code
              if (inx < lang_codes.length - 1) {
                  codesstr = codesstr + "+"
              }
          });
          xmlHttp = new XMLHttpRequest();
          xmlHttp.open( "GET", URI(api_uri) + URI("getLocale"), true);
          xmlHttp.send(null);
          xmlHttp.onload = function (e) {
            if (xmlHttp.readyState === 4) {
              if (xmlHttp.status === 200) {
                var langlocale = JSON.parse(xmlHttp.responseText);
                langlocale = langlocale[0]
                langlocale = langlocale.split(/[-_]/)
                var reqUrl = URI.decode(URI(api_uri) + URI("listLanguageNames").addQuery("locale",langlocale[0]).addQuery("languages",codesstr))
                xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", reqUrl, true );
                xmlHttp.send(null);
                xmlHttp.onload = function (e) {
                  if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                      var localedict = JSON.parse(xmlHttp.responseText);
                      locales = localedict
                      var to_lang = {}
                      $.each(Object.keys(alllangs), function(inx, lang) {
                          var text_lang = locales[lang];
                          if(!text_lang) {
                              var lang_arr = lang.split("_")
                              text_lang = locales[lang_arr[0]]
                              if (!text_lang) {
                                  text_lang = lang
                              } else {
                                  text_lang = text_lang + " " + lang_arr[1]
                              }
                          }
                          $("#from-lang").append("<option value=\"" + lang + "\">" + text_lang + "</option>")
                          $.each(alllangs[lang], function(ix, l) {
                              if (!(l in to_lang)) {
                                  var to_text_lang = locales[l];
                                  if(!to_text_lang) {
                                      var to_lang_arr = l.split("_")
                                      to_text_lang = locales[to_lang_arr[0]]
                                      if (!to_text_lang) {
                                          to_text_lang = l
                                      } else {
                                          to_text_lang = to_text_lang + " " + to_lang_arr[1]
                                      }
                                  }
                                  $("#to-lang").append("<option value=\"" + l + "\">" + to_text_lang + "</option>")
                                  to_lang[l] = 1
                              }
                          });
                      });
                      var options = $('#from-lang option');
                      var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
                      arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
                      options.each(function(i, o) {
                        o.value = arr[i].v;
                        $(o).text(arr[i].t);
                      });
                      update_selectboxes();
                      restore_options()

                    }
                  }
                }
              }
            }
          }
        } else {
          console.error(xmlHttp.statusText);
        }
        }
    };
}


function download_languages() {
    chrome.storage.sync.get("apertium-api-url", function(items) {
        if (items["apertium-api-url"]) {
            download_langs_with_uri(items["apertium-api-url"])
        } else {
            download_langs_with_uri("http://apy.projectjj.com/")
        }
    });
}

function enable_disable(str) {
  if(str == "enable-button"){
    chrome.storage.sync.get("apertium-enabled", function(items) {
        if(items["apertium-enabled"] == "On") {
            $("#"+str).html("Off")
            chrome.storage.sync.set({'apertium-enabled': $("#"+str).html()}, function() {
            });
        } else {
            $("#"+str).html("On")
            chrome.storage.sync.set({'apertium-enabled': $("#"+str).html()}, function() {
            });
        }
    });
  }else{
    chrome.storage.sync.get("page-translation-enabled", function(items) {
        if(items["page-translation-enabled"] == "On") {
            $("#"+str).html("Off")
            chrome.storage.sync.set({'page-translation-enabled': $("#"+str).html()}, function() {
            });
        } else {
            $("#"+str).html("On")
            chrome.storage.sync.set({'page-translation-enabled': $("#"+str).html()}, function() {
            });
        }
    });
  }
}

function set_btn_txt(str) {
    if(str == "enable-button"){
      chrome.storage.sync.get("apertium-enabled", function(items) {
          if(items["apertium-enabled"]) {
              $("#"+str).html(items["apertium-enabled"])
          } else {
              $("#"+str).html("Off")
              chrome.storage.sync.set({'apertium-enabled': $("#"+str).html()}, function() {
              });
          }
          if ($("#"+str).html() == "On") {
              $("#"+str).addClass('active')
          }
      });
    }else{
      chrome.storage.sync.get("page-translation-enabled", function(items) {
          if(items["page-translation-enabled"]) {
              $("#"+str).html(items["page-translation-enabled"])
          } else {
              $("#"+str).html("Off")
              chrome.storage.sync.set({'page-translation-enabled': $("#"+str).html()}, function() {
              });
          }
          if ($("#"+str).html() == "On") {
              $("#"+str).addClass('active')
          }
      });
    }
}

function update_selectboxes() {
    try{
      $("#to-lang option").attr("disabled","disabled")

      $.each(alllangs[$("#from-lang").val()], function(inx, lang) {
          $("#to-lang option[value=\'" + lang + "\']").removeAttr('disabled');
      });

      var new_list = $('#to-lang option[disabled!=\'disabled\']');
      $.merge(new_list,$('#to-lang option[disabled=\'disabled\']'))
      $("#to-lang").empty().append(new_list);
      $("#to-lang").val($("#to-lang option[disabled!=\'disabled\']").val())
    }catch(ReferenceError){

    }
}

$("#from-lang").change(function() {

    update_selectboxes()
    save_options()
});

$("#to-lang").change(function() {
    save_options()
});

$("#enable-button").click( function() {
  enable_disable("enable-button")
});




$(document).ready(function() {
    download_languages()
    set_btn_txt("enable-button")
})
