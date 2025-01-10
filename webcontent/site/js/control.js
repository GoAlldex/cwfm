var debug_mode = true;
var selected_master_folder = null;
var tmp_files_folder = Array();
var tmp_files = null;
var drop = document;
['dragenter', 'dragover'].forEach(eventName => { drop.addEventListener(eventName, preventDefaults, false); });
['dragenter', 'dragover'].forEach(eventName => { drop.addEventListener(eventName, highlight, false); });
var dropzone = document.getElementById("drag-drop");
['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, preventDefaults, false); });
['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, unhighlight, false); });
dropzone.addEventListener('drop', upload_files, false);

function msg_off() {
	var conf_box = document.getElementById("msg-box");
	if(conf_box.classList.contains("flex")) {
		conf_box.classList.remove("flex");
		conf_box.innerHTML = "";
	}
};

function msg_on(type, title, body, buttons, button_fu) {
	var conf_box = document.getElementById("msg-box");
	if(conf_box.classList.contains("flex")) {
		msg_off();
		msg_on(type, title, body, buttons, button_fu);
		return;
	}
	var box_main = document.createElement("div");
	box_main.setAttribute("class", "box-main");
	var box_header = document.createElement("div");
	box_header.setAttribute("class", "box-header text-center color-2 font-125");
	box_header.innerHTML = title;
	var box_body = document.createElement("div");
	if(type == "Error") {
		box_body.setAttribute("class", "box-body block");
		box_body.setAttribute("id", "con-body");
		box_body.innerHTML = body;
		var button_field = document.createElement("div");
		button_field.setAttribute("class", "flex justify-center align-items-center");
		for(let i = 0; i < buttons.length; i++) {
			var button_f = document.createElement("button");
			button_f.setAttribute("class", "msg-button color-2 bold");
			button_f.setAttribute("onclick", button_fu[i]);
			button_f.innerHTML = buttons[i];
			button_field.appendChild(button_f);
		}
		box_body.appendChild(button_field);
	} else {
		box_body.setAttribute("class", "box-body flex justify-center align-items-center");
	}
	box_main.appendChild(box_header);
	box_main.appendChild(box_body);
	conf_box.appendChild(box_main);
	conf_box.classList.add("flex");
};

function check_JSON(JSON_parse) {
	if(typeof JSON_parse != 'string')
		JSON_parse = JSON.stringify(JSON_parse);
	try {
		JSON.parse(JSON_parse);
		return true;
	} catch(e) {
		return false;
	}
};

function load(msg) {
	var conf_box = document.getElementById("msg-box");
	if(conf_box.classList.contains("flex")) {
		conf_box.classList.remove("flex");
		conf_box.innerHTML = "";
	}
	var load_box = document.createElement("div");
	load_box.setAttribute("class", "load-box");
	var load_img = document.createElement("img");
	load_img.setAttribute("class", "load-circle");
	load_img.setAttribute("src", "./images/load_1.png");
	load_img.setAttribute("alt", "Lade");
	var text_box = document.createElement("span");
	text_box.setAttribute("id", "loadboxtext");
	text_box.innerText = msg;
	load_box.appendChild(load_img);
	load_box.appendChild(text_box);
	conf_box.appendChild(load_box);
	conf_box.classList.add("flex");
};

function save(msg) {
	var conf_box = document.getElementById("msg-box");
	if(conf_box.classList.contains("flex")) {
		msg_off();
		save(msg);
		return;
	}
	var save_box = document.createElement("div");
	save_box.setAttribute("class", "save-box");
	var save_img = document.createElement("img");
	save_img.setAttribute("class", "save-anim");
	save_img.setAttribute("src", "./images/check_1.png");
	save_img.setAttribute("alt", "Save");
	var text_box = document.createElement("span");
	text_box.setAttribute("id", "saveboxtext");
	text_box.innerText = msg;
	save_box.appendChild(save_img);
	save_box.appendChild(text_box);
	conf_box.appendChild(save_box);
	conf_box.classList.add("flex");
};

function manage_functions(function_name, data) {
	switch(function_name[1]) {
		default:
			window[function_name[0]](data);
		break;
		case 0:
			window[function_name[0]](data);
		break;
		case 1:
			var fu = "";
			for(let i = 2; i < function_name.length; i++) {
				if(i == 2) {
					fu += function_name[i];
				} else {
					fu += "<!=!>"+function_name[i];
				}
			}
			window[function_name[0]](fu, data);
		break;
		case 2:
			var fu = "";
			for(let i = 2; i < function_name.length; i++) {
				if(i == 2) {
					fu += function_name[i];
				} else {
					fu += "<!=!>"+function_name[i];
				}
			}
			window[function_name[0]](fu);
		break;
	};
};


function main_backend_request(script, functions, data) {
	$.ajax({
		url: "./"+script+".php",
		type: "POST",
		data: data,
		processData: false,
		contentType: false,
		success: function(response) {
			if(check_JSON(response) === true) {
				var data = Object();
				data = JSON.parse(response);
				if(typeof data["ERROR"] != "undefined") {
					var error_msg = "";
					for(i = 0; i < data["ERROR"].length; i++) {
						if(i == 0) {
							error_msg = data["ERROR"][0];
						} else {
							error_msg += "<br>"+data["ERROR"][i];
						}
					}
					var type = "Error";
					var title = "Fehler!";
					var body = error_msg;
					var buttons = Array();
					buttons.push("OK");
					var button_fu = Array();
					button_fu.push("msg_off()");
					msg_on(type, title, body, buttons, button_fu);
				} else {
					if(functions != null) {
						var manage_errors = Array();
						for(let i = 0; i < functions.length; i++) {
							if(typeof window[functions[i][0]] === "function") {
								if(functions[i].length == 1) {
									window[functions[i][0]]();
								} else {
									manage_functions(functions[i], data)
								}
							} else {
								manage_errors.push("Funktion: "+functions[i][0]+" nicht gefunden");
							}
						}
						if(manage_errors.length != 0) {
							var type = "Error";
							var title = "Fehler!";
                            var body = "";
							if(!window.debug_mode) {
								body = "Skript Fehler, bitte an den Entwickler wenden";
							} else {
								for(let i = 0; i < manage_errors.length; i++) {
									if(i == 0) {
										body = manage_errors[i];
									} else {
										body += "<br>"+manage_errors[i];
									}
								}
							}
							var buttons = Array();
							buttons.push("OK");
							var button_fu = Array();
							button_fu.push("msg_off()");
							msg_on(type, title, body, buttons, button_fu);
						}
					}
				}
			} else {
				var type = "Error";
				var title = "Fehler!";
                var body = "";
				if(!window.debug_mode) {
					body = "Der Server hat etwas seltsammes zurückgegeben";
				} else {
					if(response != "") {
						body = response;
					} else {
						body = "Der Server hat kein Ergebnis zurückgeliefert";
					}
				}
				var buttons = Array();
				buttons.push("OK");
				var button_fu = Array();
				button_fu.push("msg_off()");
				msg_on(type, title, body, buttons, button_fu);
			}
		},
		error: function(response) {
			var type = "Error";
			var title = "Fehler!";
			var body = "Der Server ist nicht erreichbar";
			var buttons = Array();
			buttons.push("OK");
			var button_fu = Array();
			button_fu.push("msg_off()");
			msg_on(type, title, body, buttons, button_fu);
		}
	});
};

function get_master_folders(mode) {
	load("Liste Verzeichnisse...");
	var data = new FormData();
	data.append("get", 1);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "get_master_folders_success";
	fu[0][1] = 1;
	fu[0][2] = mode;
	main_backend_request("./scripts/get_master_folders", fu, data);
};

function get_master_folders_success(mode, data) {
	var menue_box = document.getElementById("menue-content");
	menue_box.innerHTML = "";
	for(let i = 0; i < data.length; i++) {
		var menue_content = document.createElement("div");
		menue_content.setAttribute("id", "master-folder-"+data[i][0]);
		menue_content.setAttribute("class", "menue-content justify-start align-items-center");
		var menue_text = document.createElement("div");
		menue_text.setAttribute("class", "menue-content-text color-10 font-150 bold");
		menue_text.setAttribute("title", data[i][1]);
		menue_text.setAttribute("onclick", "select_master_folder("+data[i][0]+")");
		menue_text.innerText = data[i][1];
		var menue_edit = document.createElement("img");
		menue_edit.setAttribute("class", "menue-content-button");
		menue_edit.setAttribute("src", "./images/edit_1.png");
		menue_edit.setAttribute("title", "Hauptordner "+data[i][1]+" bearbeiten");
		menue_edit.setAttribute("onclick", "ask_edit_master_folder("+data[i][0]+")");
		var menue_remove = document.createElement("img");
		menue_remove.setAttribute("class", "menue-content-button bg-red");
		menue_remove.setAttribute("src", "./images/delete_1.png");
		menue_remove.setAttribute("title", "Hauptordner "+data[i][1]+" entfernen");
		menue_remove.setAttribute("onclick", "ask_remove_master_folder("+data[i][0]+")");
		menue_content.appendChild(menue_text);
		menue_content.appendChild(menue_edit);
		menue_content.appendChild(menue_remove);
		menue_box.appendChild(menue_content);
		if(mode != 0 && window.selected_master_folder == data[i][0]) {
			menue_content.classList.add("menue-content-active");
			menue_text.classList.remove("color-10");
		}
	}
	msg_off();
};

function new_master_folder() {
	var type = "Error";
	var title = "Neuer Ordner";
	var body = '<label class="label-msg font-100">Ordnername:</label>';
	body += '<input type="text" class="input-msg font-100" name="folder-name" placeholder="Ordnername..." title="Bitte geben Sie einen Ordnernamen ein" autocomplete="off">';
	var buttons = Array();
	buttons.push("Erstellen");
	buttons.push("Abbrechen");
	var button_fu = Array();
	button_fu.push("save_master_folder()");
	button_fu.push("msg_off()");
	msg_on(type, title, body, buttons, button_fu);
};

function save_master_folder() {
	var name = document.getElementsByName("folder-name")[0].value;
	var data = new FormData();
	data.append("save", 1);
	data.append("name", name);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "save_master_folder_success";
	fu[0][1] = 0;
	main_backend_request("./scripts/save_master_folder", fu, data);
};

function save_master_folder_success() {
	save("Neuer Ordner erfolgreich gespeichert");
	setTimeout(function () { get_master_folders(1); }, 3000);
};

function ask_edit_master_folder(id) {
	var folder_name = document.getElementById("master-folder-"+id).childNodes[0].innerText;
	var type = "Error";
	var title = "Ordner umbenennen";
	var body = '<label class="label-msg font-100">Neuer Ordnername:</label>';
	body += '<input type="text" class="input-msg font-100" name="folder-name" placeholder="Ordnername..." title="Bitte geben Sie einen Ordnernamen ein" autocomplete="off" value="'+folder_name+'">';
	var buttons = Array();
	buttons.push("Speichern");
	buttons.push("Abbrechen");
	var button_fu = Array();
	button_fu.push("edit_master_folder("+id+")");
	button_fu.push("msg_off()");
	msg_on(type, title, body, buttons, button_fu);
};

function edit_master_folder(id) {
	var name = document.getElementsByName("folder-name")[0].value;
	var data = new FormData();
	data.append("save", 1);
	data.append("id", id);
	data.append("name", name);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "edit_master_folder_success";
	fu[0][1] = 0;
	main_backend_request("./scripts/edit_master_folder", fu, data);
};

function edit_master_folder_success() {
	save("Neuer Ordnername erfolgreich gespeichert");
	setTimeout(function () { get_master_folders(1); }, 3000);
};

function ask_remove_master_folder(id) {
	var type = "Error";
	var title = "Ordner entfernen";
	var body = "Sind Sie sicher, das Sie den Ordner <span class='bold color-5'>entfernen</span> möchten?<br>";
	body += "Alle Dateien innerhalb dieses Ordner werden <span class='bold color-5'>unwiederuflich</span> entfernt";
	var buttons = Array();
	buttons.push("Entfernen");
	buttons.push("Abbrechen");
	var button_fu = Array();
	button_fu.push("remove_master_folder("+id+")");
	button_fu.push("msg_off()");
	msg_on(type, title, body, buttons, button_fu);
};

function remove_master_folder(id) {
	load("Entferne Hauptverzeichnis...");
	var data = new FormData();
	data.append("remove", 1);
	data.append("id", id);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "remove_master_folder_success";
	fu[0][1] = 1;
	fu[0][2] = id;
	main_backend_request("./scripts/remove_master_folder", fu, data);
};

function remove_master_folder_success(id, data) {
	save("Hauptverzeichnis "+data[0]+" mit "+data[1]+" Datein vollständig entfernt");
	var rm = document.getElementById("master-folder-"+id);
	rm.parentElement.removeChild(rm);
	if(window.selected_master_folder != null && window.selected_master_folder == parseInt(id)) {
		document.getElementById("content").innerHTML = "";
		window.selected_master_folder = null;
	}
	setTimeout(function () { msg_off(); }, 3000);
};

function select_master_folder(id) {
	var folders = document.getElementsByClassName("menue-content");
	var folder_names = document.getElementsByClassName("menue-content-text");
	for(let i = 0; i < folders.length; i++) {
		if(folders[i].classList.contains("menue-content-active")) {
			folders[i].classList.remove("menue-content-active");
			folder_names[i].classList.add("color-10");
		}
	}
	document.getElementById("master-folder-"+id).classList.add("menue-content-active");
	document.getElementById("master-folder-"+id).childNodes[0].classList.remove("color-10");
	window.selected_master_folder = parseInt(id);
};

function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
};

function highlight(e) {
	if(window.selected_master_folder != null) {
		document.getElementById("drag-drop").classList.add('flex');
	}
};

function unhighlight(e) {
	document.getElementById("drag-drop").classList.remove('flex');
};

function upload_files(data_files) {
	if(window.selected_master_folder != null) {
		var data = data_files.dataTransfer;
		var files = data.files;
		window.tmp_files = Array.from(files);
		var upload_box = document.getElementById("upload-process");
		upload_box.classList.add("flex");
		var content = document.getElementById("content");
		content.setAttribute("style", "height: calc(100% - 3.25rem);");
		for(let i = 0; i < window.tmp_files.length; i++) {
			var upload_item = document.createElement("div");
			upload_item.setAttribute("class", "upload-item");
			upload_item.setAttribute("title", "Entfernen");
			var upload_img = document.createElement("img");
			upload_img.setAttribute("class", "upload-icon");
			upload_img.setAttribute("src", "./images/image_1.png");
			upload_item.appendChild(upload_img);
			upload_box.appendChild(upload_item);
			window.tmp_files_folder.push(window.selected_master_folder);
		}
		upload_process();
	}
};

function upload_process() {
	set_active_upload();
	var data = new FormData();
	data.append("save", 1);
	data.append("id", window.tmp_files_folder[0])
	data.append("file", window.tmp_files[0]);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "upload_process_success";
	fu[0][1] = 0;
	main_backend_request("./scripts/save_upload_file", fu, data);
};

function upload_process_success() {
	var upload_box = document.getElementById("upload-process");
	upload_box.removeChild(upload_box.firstChild);
	window.tmp_files.splice(0, 1);
	window.tmp_files_folder.splice(0, 1);
	if(window.tmp_files.length == 0) {
		window.tmp_files = null;
		window.tmp_files_folder = Array();
		upload_box.classList.remove("flex");
		var content = document.getElementById("content");
		content.removeAttribute("style");
	} else {
		upload_process();
	}
};

function set_active_upload() {
	var upload_box = document.getElementById("upload-process");
	upload_box.firstChild.classList.add("active-upload");
};