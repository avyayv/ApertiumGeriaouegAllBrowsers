jQuery.fn.exists = function(){ return this.length > 0; }

function save_options() {
    var fr_lang = $("#from-langs").val()
    var to_lang = $("#to-langs").val()
    if((fr_lang != "emptylang") && (to_lang != "emptylang")){
        chrome.storage.sync.set({'fr-langs': fr_lang, 'to-langs': to_lang}, function() {
            alert_msg = "Success! Reload pages for changes to take effect."
            $("#to-langs option[value='emptylang']").remove();
            $("#from-langs option[value='emptylang']").remove();

            // $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
        });
    }
}

function restore_options() {
    chrome.storage.sync.get(["fr-langs", "to-langs"], function(items) {
        if (items["fr-langs"] && items["to-langs"]) {
            $("#from-langs").val(items["fr-langs"])
            update_selectboxes()
            $("#to-langs").val(items["to-langs"])

        } else {
            $("#from-langs").prepend("<option value=\"emptylang\"></option>")
            $("#from-langs").val("emptylang")
            $("#to-langs").prepend("<option value=\"emptylang\"></option>")
            $("#to-langs").val("emptylang")
        }

    });

}

function update_selectboxes() {
    try{
      $("#to-langs option").attr("disabled","disabled")
      $.each(alllangs[$("#from-langs").val()], function(inx, lang) {
          $("#to-langs option[value=\'" + lang + "\']").removeAttr('disabled');
      });
      var new_list = $('#to-langs option[disabled!=\'disabled\']');
      $.merge(new_list,$('#to-langs option[disabled=\'disabled\']'))
      $("#to-langs").empty().append(new_list);
      $("#to-langs").val($("#to-langs option[disabled!=\'disabled\']").val())
    }catch(TypeError){

    }
}

$(document).ready(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {command: "sends"}, function(response) {
      alllangs = response.al
      locales = response.ls
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
          $("#from-langs").append("<option value=\"" + lang + "\">" + text_lang + "</option>")
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
                  $("#to-langs").append("<option value=\"" + l + "\">" + to_text_lang + "</option>")
                  to_lang[l] = 1
              }
          });
      });
      var options = $('#from-langs option');
      var arr = options.map(function(_, o) { return { t: $(o).text(), v: o.value }; }).get();
      arr.sort(function(o1, o2) { return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0; });
      options.each(function(i, o) {
        o.value = arr[i].v;
        $(o).text(arr[i].t);
      });
      update_selectboxes()
      restore_options()


    });
  });
})

$("#translate-button").click(function() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {greeting: "translate"}, function(response) {
    })
  })
});

$("#from-langs").change(function() {
    update_selectboxes()
    save_options()
});

$("#to-langs").change(function() {
    save_options()
});
