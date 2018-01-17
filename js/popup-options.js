var alllangs = {}
var locales = {}



function save_options() {
    var fr_lang = $("#from-lang").val()
    var to_lang = $("#to-lang").val()
    if((fr_lang != "emptylang") && (to_lang != "emptylang")){
        browser.storage.sync.set({
          fromlang: fr_lang
        });

        browser.storage.sync.set({
          tolang : to_lang
        });

        alert_msg = "Success! Reload pages for changes to take effect."
        $("#to-lang option[value='emptylang']").remove();
        $("#from-lang option[value='emptylang']").remove();


    }
}

function restore_options() {
    var fr_lang = browser.storage.sync.get('fromlang')
    var to_lang = browser.storage.sync.get('tolang')
    to_lang.then((res) => {
      fr_lang.then((res_two)=> {
        if (fr_lang && to_lang) {
            $("#from-lang").val(res_two.fromlang)
            update_selectboxes()
            $("#to-lang").val(res.tolang)
        } else {
            $("#from-lang").prepend("<option value=\"emptylang\"></option>")
            $("#from-lang").val("emptylang")
            $("#to-lang").prepend("<option value=\"emptylang\"></option>")
            $("#to-lang").val("emptylang")
        }
      })
    })
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
    var apertium_api_uri = browser.storage.sync.get('apertiumapiuri')
    apertium_api_uri.then((res) => {
      if (res.apertiumapiuri) {
          console.log(res.apertiumapiuri)
          download_langs_with_uri(res.apertiumapiuri)
      } else {
          download_langs_with_uri("http://apy.projectjj.com/")
      }
    })

}

function enable_disable(str) {
  if(str == "enable-button"){
    var apertium_enabled = browser.storage.sync.get('apertiumenabled')

    apertium_enabled.then((res)=>{
      if(res.apertiumenabled == "On") {
          $("#"+str).html("Off")
          browser.storage.sync.set(
            {apertiumenabled: $("#"+str).html()}
          )
      } else {
          $("#"+str).html("On")
          browser.storage.sync.set(
            {aperiumenabled: $("#"+str).html()}
          );
      }
    })

    // });
  }else{
    var apertium_api_uri = browser.storage.sync.get("pagetranslationenabled")
    apertium_api_uri.then((res) => {
      if(res.pagetranslationenabled == "On") {
          $("#"+str).html("Off")
          browser.storage.sync.set({pagetranslationenabled: $("#"+str).html()}
          );
      } else {
          $("#"+str).html("On")
          browser.storage.sync.set({pagetranslationenabled: $("#"+str).html()}
          );
      }
    })
  }
}

function set_btn_txt(str) {
    if(str == "enable-button"){
      var apertium_enabled = browser.storage.sync.get('apertiumenabled');
      apertium_enabled.then((res)=> {
        if(res.apertiumenabled) {
            $("#"+str).html(res.apertiumenabled)
        } else {
            $("#"+str).html("Off")
            browser.storage.sync.set({apertiumenabled: $("#"+str).html()});
        }
        if ($("#"+str).html() == "On") {
            $("#"+str).addClass('active')
        }
      })

    }else{
      var page_translation_enabled = browser.storage.sync.get("pagetranslationenabled")
      page_translation_enabled.then((res) => {
        if(res.pagetranslationenabled) {
            $("#"+str).html(res)
        } else {
            $("#"+str).html("Off")
            browser.storage.sync.set({pagetranslationenabled: $("#"+str).html()});
        }
        if ($("#"+str).html() == "On") {
            $("#"+str).addClass('active')
        }
      })

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

function handleResponse(message) {
  console.log(`Message from the background script:  ${message.response}`);
}

function handleError(error) {
  console.log(error);
}

// $("#translate-page-button").click(function () {
//
//   page_translation_enabled.then((res) => {
//     browser.runtime.sendMessage({"greeting": e.target.href});
//     var sending = browser.runtime.sendMessage({
//       greeting: $("#translate-page-button").html()
//     });
//     var sending_two = browser.runtime.sendMessage({
//       greeting: res.pagetranslationenabled
//     });
//   })
// });
$("#translate-page-button").click(function () {
  var page_translation_enabled = browser.storage.sync.get("pagetranslationenabled")
  page_translation_enabled.then((res) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: $("#translate-page-button").html()}, function(response) {
        });
    });
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: res.pagetranslationenabled}, function(response) {

        });
    });
  })
});


$(document).ready(function() {
    download_languages()
    set_btn_txt("enable-button")
})
