const color_defaults = {
	like_color: "#00FF48",
	dislike_color: "#FF2222",
	neutral_color: "#CCCCCC",
}

function save_colors(){
	let colors = {};

	for (const option_name in color_defaults) {
		colors[option_name] = document.getElementById(option_name).value;
	}

	chrome.storage.sync.set({"colors": colors});
}

function load_data(){
	chrome.storage.sync.get(["user_tags", "options", "colors"], function(response){
		let options = response["options"] ? response["options"] : {};
		let colors = response["colors"] ? response["colors"] : {};
		let user_tags = response["user_tags"] ? response["user_tags"] : {};

		console.log(colors);

		// Options
		// no non-color, non-tag options yet

		// Colors
		for (const color_name in color_defaults) {
			if (!(color_name in colors)) {
				colors[color_name] = color_defaults[color_name];
			}
		}

		for (const color_name in color_defaults) {
			document.getElementById(color_name).value = colors[color_name];
		}
		let list_div = document.getElementById("tag_list_div");

		// Tags
		for (const tag_name in user_tags) {
			console.log("processing tag: " + tag_name);
			let tag = user_tags[tag_name];

			let tag_span = document.createElement('span');
			tag_span.style.background = colors['neutral_color'];
			if (tag.flag_as == "like") {
				tag_span.classList.add("sidecar_tag_like");
				tag_span.style.background = colors['like_color'];
			}
			if (tag.flag_as == "dislike") {
				tag_span.classList.add("sidecar_tag_dislike");
				tag_span.style.background = colors['dislike_color'];
			}
			tag_span.classList.add("sidecar_tag");
			tag_span.innerText = tag_name;

			list_div.appendChild(tag_span);
			list_div.appendChild(document.createElement('br'));
		}

	});
}

document.addEventListener("DOMContentLoaded", function () {
	load_data();

	let save_on_change_except_these = [
		"confirm_reset_tags",
		"reset_tags",
	]

	for(const inp of document.querySelectorAll("input")) {
		if (save_on_change_except_these.indexOf(inp.id) == -1) {
			inp.addEventListener("change", save_colors);
		}

		if (inp.id == "confirm_reset_tags") {
			inp.addEventListener("change", function() {
				document.getElementById("reset_tags").disabled = !inp.checked;
			});
		}

		if (inp.id == "reset_tags") {
			inp.addEventListener("click", function() {
				console.log("Resetting all tags!")
				document.getElementById("confirm_reset_tags").checked = false;
				document.getElementById("reset_tags").disabled = true;
				document.getElementById("tag_list_div").innerHTML = "";
				chrome.storage.sync.remove("user_tags").then(() => {
  					console.log("Tags have been reset!");
				});
			});
		}

		if (inp.id == "confirm_reset_colors") {
			inp.addEventListener("change", function() {
				document.getElementById("reset_colors").disabled = !inp.checked;
			});
		}

		if (inp.id == "reset_colors") {
			inp.addEventListener("click", function() {
				document.getElementById("confirm_reset_colors").checked = false;
				document.getElementById("reset_colors").disabled = true;

				for (const color_name in color_defaults) {
					console.log(color_name + "=" + color_defaults[color_name]);
					document.getElementById(color_name).value = color_defaults[color_name];
				}

				chrome.storage.sync.set({"colors": color_defaults});
			});
		}

	}
});