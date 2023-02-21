function save_options(){
	// chrome.storage.sync.set({"options": document.getElementById("").checked});
}

function load_options(){
	chrome.storage.sync.get(["options"], function(items){
		// if(items["options"] == true) {
		// 	document.getElementById("options").checked = true;
		// }

	});
	chrome.storage.sync.get(["user_tags"], function(response) {

	});
}

document.addEventListener("DOMContentLoaded", function () {
	load_options();

	for(const inp of document.querySelectorAll("input")) {
		 inp.addEventListener("change", save_options);
	}
});