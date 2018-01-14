function restore_options() {
    chrome.storage.sync.get("apertium-api-url", function(items) {
        if(items["apertium-api-url"]) {

          $("#apibox").val(items["apertium-api-url"])

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
    chrome.storage.sync.set({'apertium-api-url': value}, function() {
        chrome.storage.sync.remove(["fr-lang", "to-lang"])
        alert_msg = "Success!"
        $("#alert-area").append("<div class=\"alert alert-success alert-dismissible\" role=\"alert\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\"><span aria-hidden=\"true\">&times;</span></button>" + alert_msg + "</div>")
    });
}

function restore_default_api_path() {
    chrome.storage.sync.set({'apertium-api-url': "http://beta.apertium.org/apy/"}, function() {
        $("#apibox").val("http://beta.apertium.org/apy/")
    });
}

$("#submit").click( function() {
    save_api_path()
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
