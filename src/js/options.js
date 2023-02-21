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
		console.log("got user_tags");
		let user_tags = response["user_tags"] ? response["user_tags"] : {};
		let list_div = document.getElementById("tag_list_div");

		for (const tag_name in user_tags) {
			console.log("processing tag: " + tag_name);
			let tag = user_tags[tag_name]

			tag_class = (tag.flag_as == "like") ? 'sidecar_tag_like' :
			            (tag.flag_as == "dislike") ? 'sidecar_tag_dislike' :
						'sidecar_tag';

			let tag_span = document.createElement('span');
			tag_span.classList.add("sidecar_tag");
			tag_span.classList.add(tag_class);
			tag_span.innerText = tag_name;

			list_div.appendChild(tag_span);
			list_div.appendChild(document.createElement('br'));
		}

	});
}

document.addEventListener("DOMContentLoaded", function () {
	load_options();

	let save_on_change_except_these = [
		"confirm_reset_tags",
		"reset_tags",
	]

	for(const inp of document.querySelectorAll("input")) {
		if (save_on_change_except_these.indexOf(inp.id) == -1) {
			inp.addEventListener("change", save_options);
		}

		if (inp.id == "confirm_reset_tags") {
			inp.addEventListener("change", function() {
				let reset_button = document.getElementById("reset_tags");
				if (inp.checked) {
					reset_button.disabled = false;
				} else {
					reset_button.disabled = true;
				}
			});
		}

		if (inp.id == "reset_tags") {
			inp.addEventListener("click", function() {
				console.log("Resetting all tags!")
				document.getElementById("confirm_reset_tags").checked = false;
				document.getElementById("reset_tags").disabled = true;
				chrome.storage.sync.remove("user_tags").then(() => {
  					console.log("Tags have been reset!");
				});
			});
		}

	}


});