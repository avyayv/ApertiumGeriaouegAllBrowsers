function restore_options() {
      uri = browser.storage.sync.get("apertiumapiuri")
      uri.then((res)=>{
        if(uri.apertiumapiuri) {
          $("#apibox").val(uri.apertiumapiuri)
        } else {
          restore_default_api_path()
        }
      });
}

function save_api_path() {
    var value = ""
    if($("#apibox").val().substr($("#apibox").val().length-1) != "/"){
      value = ($("#apibox").val()+'/')
    }else{
      value = ($("#apibox").val())
    }
    browser.storage.sync.set({apertiumapiuri: value})
    console.log(value)
    // browser.storage.sync.remove(["fromlang", "tolang"])
    alert_msg = "Success!"
    $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
}

function restore_default_api_path() {
    browser.storage.sync.set({apertiumapiuri: "http://beta.apertium.org/apy/"});
    $("#apibox").val("http://beta.apertium.org/apy/")
}

$("#submit").click( function() {
    save_api_path()
    uri = browser.storage.sync.get("apertiumapiuri")
    uri.then((res)=> {
      console.log(res.apertiumapiuri)
    })
    console.log()
});

$("#restore-defaults").click( function() {
    restore_default_api_path()
});

$("#from-lang").change(function() {
    update_selectboxes()
    save_options()
});

$("#from-lang-box").change(function() {
});
$("#to-lang-box").change(function() {
});

$("#to-lang").change(function() {
    save_options()
});

$(document).ready(function() {
    restore_options()
});
