var user_tags = null;

function addElement(id){
	chrome.storage.sync.get(["user_tags"], function(response){

		var user_tags = response["user_tags"] ? response["user_tags"] : {};

		for (const ut in user_tags) {
			console.log(ut + ":" + user_tags[ut].flag_as);
		}

		// user_tags = {
		// 	'Co-op': {
		// 		flag_as: "like"
		// 	},
		// 	PvP: {
		// 		flag_as: "dislike"
		// 	}
		// };
		// saveTagsToCloud(user_tags);

		const sidecarDiv = document.createElement("div");
		sidecarDiv.id = id;

		const sidecar_title = document.createElement("div");
		sidecar_title.innerText = "SteamSidecar";
		sidecar_title.classList.add('sidecar_title');
		sidecarDiv.appendChild(sidecar_title);

		const sidecar_tag_title = document.createElement("div");
		sidecar_tag_title.innerText = "Tags";
		sidecar_tag_title.classList.add('sidecar_tag_title');
		sidecarDiv.appendChild(sidecar_tag_title);

		const sidecar_text = document.createElement("div");
		sidecar_text.innerText = "ctrl to modify; left-click likes, right-click dislikes";
		sidecar_text.classList.add('sidecar_text');
		sidecarDiv.appendChild(sidecar_text);

		var tags_list = document.getElementsByClassName("glance_tags popular_tags")[0].getElementsByTagName('a');
		
		for (const steam_tag of tags_list) {
			var tag_name = steam_tag.innerText.trim()
			tagSpan = document.createElement("span");
			tagSpan.classList.add('sidecar_tag');
			tagSpan.innerText = tag_name;
			if (tag_name in user_tags) {
				var tag_data = user_tags[tag_name];
				if (tag_data.flag_as == "like") {
					tagSpan.classList.add('sidecar_tag_like');
				}
				if (tag_data.flag_as == "dislike") {
					tagSpan.classList.add('sidecar_tag_dislike');
				}
			}
			tagSpan.onclick = tagClick;
			tagSpan.oncontextmenu = tagClick;
			sidecarDiv.appendChild(tagSpan);
		}


		document.body.appendChild(sidecarDiv);
	});
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function removeElement(id){
	var elem = document.getElementById(id);
	return elem.parentNode.removeChild(elem);
}

function tagClick(event) {
	console.log(event.button);
	clicked_tag = this;
	if (event.ctrlKey) {
		switch(event.button) {
			case 0:  // left click
				likeTag(clicked_tag);
				break;
			case 2:  // right click
				dislikeTag(clicked_tag);
				return false;  // prevents context menu
				break;
		}
	}
	if (event.altKey) {
		switch(event.button) {
			case 0:  // left click
				unsetTag(clicked_tag);
				break;
			case 2:  // right click
				// return false;  // prevents context menu
				break;
		}
	}
}

function likeTag(clicked_tag) {
	clicked_tag.classList.add('sidecar_tag_like');
	clicked_tag.classList.remove('sidecar_tag_dislike');
	saveTagsToCloud({[clicked_tag.innerText]: {flag_as: 'like'}});
}

function dislikeTag(clicked_tag) {
	clicked_tag.classList.add('sidecar_tag_dislike');
	clicked_tag.classList.remove('sidecar_tag_like');
	saveTagsToCloud({[clicked_tag.innerText]: {flag_as: 'dislike'}});
}

function unsetTag(clicked_tag) {
	clicked_tag.classList.remove('sidecar_tag_like');
	clicked_tag.classList.remove('sidecar_tag_dislike');
	saveTagsToCloud({[clicked_tag.innerText]: {flag_as: 'REMOVE'}});
}

async function saveTagsToCloud(new_tags) {
	// this is really hacky with the sleep, but it's a reasonable stopgap
	// I suppose that the real solution should be to make a service worker manage
	// the saving and loading.
	let sleep_count = 0;
	while (window.steam_sidecar_saving_lock) {
		console.log("Couldn't save tags; retry #" + sleep_count);
		await sleep(5000);	
		sleep_count++;
		if (sleep_count > 10) {
			console.log("Couldn't save tags!  Did not save changes to tags:");
			console.log(JSON.stringify(new_tags));
			return false;
		}
	}

	window.steam_sidecar_saving_lock = true;
	console.log("Got lock.");
	chrome.storage.sync.get(["user_tags"], function(response){
		var user_tags = response["user_tags"] ? response["user_tags"] : {};
		for (const ut in user_tags) {
			console.log(ut + ":" + user_tags[ut].flag_as);
		}
		console.log("Got user_tags from store.");
		for (const tag_name in new_tags) {
			user_tags[tag_name] = new_tags[tag_name];
		}
		for (const tag_name in user_tags) {
			if (user_tags[tag_name].flag_as == 'REMOVE') {
				delete user_tags[tag_name];
			}
		}

		console.log("user_tags updated; writing back to store.");
		for (const ut in user_tags) {
			console.log(ut + ":" + user_tags[ut].flag_as);
		}
		chrome.storage.sync.set({ "user_tags": user_tags}, function(response) {
			console.log("user_tags written to store.");
	    	delete window.steam_sidecar_saving_lock;
			console.log("Released lock.");
		});
	});
}

if(document.getElementById("sidecar_element")){
	removeElement("sidecar_element");
}else{
	addElement("sidecar_element");
}
