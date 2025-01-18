/***********************************************************
Anzeigen von Fehlermeldungen die vom Server zurückkommen
(PHP Meldungen error online...)
***********************************************************/
var debug_mode = true;

/***********************************************************
Hauptverzeichnis
***********************************************************/
var selected_master_folder = null;

/***********************************************************
Datei Upload Variablen und Listener
***********************************************************/
var tmp_files_folder = Array();
var tmp_files = null;
var drop = document;
['dragenter', 'dragover'].forEach(eventName => { drop.addEventListener(eventName, preventDefaults, false); });
['dragenter', 'dragover'].forEach(eventName => { drop.addEventListener(eventName, highlight, false); });
var dropzone = document.getElementById("drag-drop");
['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, preventDefaults, false); });
['dragleave', 'drop'].forEach(eventName => { dropzone.addEventListener(eventName, unhighlight, false); });
dropzone.addEventListener('drop', upload_files, false);
var x = null;
var y = null;

/***********************************************************
Kontextmenü Listener
***********************************************************/
document.addEventListener('mousemove', onMouseUpdate, false);
document.addEventListener('click', closeContext, false);

/***********************************************************
Audio wiedergeben
***********************************************************/
var duration = null;

/***********************************************************
Nachrichtenbox schließen
***********************************************************/
function msg_off() {
	var conf_box = document.getElementById("msg-box");
	if(conf_box.classList.contains("flex")) {
		conf_box.classList.remove("flex");
		conf_box.innerHTML = "";
	}
};

/***********************************************************
Nachrichtenbox
- Backend Fehler Anzeigen
- Sonstige Benachrichtungen die in Funktionen definiert
wurden
***********************************************************/
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

/***********************************************************
Lade Nachrichtenbox
***********************************************************/
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

/***********************************************************
Speichern erforgreich Nachrichtenbox
***********************************************************/
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

/***********************************************************
Aufruf von Funktionen die in der Backendabfrage gefordert
wurden:
- Funktion mit ermittelten Backendaten aufrufen
- Funktion mit ermittelten Backendaten und übergabe
Parametern aufrufen
- Funktion mit übergabe Parametern aufrufen
***********************************************************/
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

/***********************************************************
Prüfen ob vom Backend Daten im JSON Format zurückgegeben
wurden
***********************************************************/
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

/***********************************************************
Backend Abfrage:
- Aufruf Nachrichtenxox bei PHP Fehlern (Abgefangene Fehler
als auch Skriptfehler und Verbindungsfehler)
- Aufruf von folge Funktionen nach der Backendabfrage (mit
durchschleifen von Parametern und ermittelten Daten)
***********************************************************/
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

/***********************************************************
Hauptverzeichnisse aus der Datenbank ermitteln
***********************************************************/
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

/***********************************************************
Anzeigen der Hauptverzeichnisse als Menüpunkt:
- Wenn die variable mode nicht 0 entspricht handelt es sich
um ein neulade Befehl, das zuletzt ausgewählte
Hauptverzeichnis wird wieder farbig hinterlegt
***********************************************************/
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

/***********************************************************
Nachrichtenbox mit Eingabefeld um ein neues Hauptverzeichnis
anzulegen
***********************************************************/
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

/***********************************************************
Neues Hauptverzeichnis in der Datenbank speichern
***********************************************************/
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

/***********************************************************
Hauptverzeichnis erfolgreich angelegt Benachrichtigung und
neu laden der Hauptverzeichnisse
***********************************************************/
function save_master_folder_success() {
	save("Neuer Ordner erfolgreich gespeichert");
	setTimeout(function () { get_master_folders(1); }, 3000);
};

/***********************************************************
Nachrichtenbox und Eingabefelder um das Hauptverzeichnis
umzubenennen
***********************************************************/
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

/***********************************************************
Hauptverzeichnis umbenennung in der Datenbank speichern
***********************************************************/
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

/***********************************************************
Haptverzeichnis Erforgreich umbenannt Benachrichtung und
neu laden der Hauptverzeichnisse
***********************************************************/
function edit_master_folder_success() {
	save("Neuer Ordnername erfolgreich gespeichert");
	setTimeout(function () { get_master_folders(1); }, 3000);
};

/***********************************************************
Nachrichtenbox Hauptverzeichnis entfernen
***********************************************************/
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

/***********************************************************
Hauptverzeichnis und enthaltene Dateine entfernen:
- Dateien auf Webserver entfernen
- Datenbankeinträge für Dateien entfernen
- Datenbankeintrag des Hauptverzeichnisses entfernen
***********************************************************/
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

/***********************************************************
Hauptverzeichnis entfernt Benachrichtigung und entfernen
des HTML Menüpunkts
***********************************************************/
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

/***********************************************************
Hervorhebung des Angeklickten Menüpunkts:
- Angeklickten Menüpunkt merken
- Angeklickten Menüpunkt farbig hinterlegen
- Farbige hinterlegung anderer Menüpunkte entfernen
***********************************************************/
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
	get_master_folder_contents(id);
};

/***********************************************************
Holen der Dateien von einem Hauptverzeichnis
***********************************************************/
function get_master_folder_contents(id) {
	load("Lade Dateien...");
	var data = new FormData();
	data.append("get", 1);
	data.append("id", id);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "get_master_folder_contents_success";
	fu[0][1] = 0;
	main_backend_request("./scripts/get_master_folder_contents", fu, data);
};

/***********************************************************
Umrechnung der Dateigröße in:
- Byte, Kilobyte, Megabyte, Gigabyte, Terrabyte
***********************************************************/
function fsize(file_size) {
	var fs_count = 0;
	var fs = file_size;
	while(fs > 1024) {
		fs_count++;
		fs = fs/1024;
		if(fs_count == 4) {
			break;
		}
	}
	fs = Math.round(fs*100)/100;
	var fs_name = Array("B", "KB", "MB", "GB", "TB");
	return fs.toString()+" "+fs_name[fs_count];
};

/***********************************************************
Datei im Hauptverzeichnis anzeigen:
- Miniaturansicht nach Dateityp
- Bilder haben als Miniatur Icon immer ihr eigenes Bild
- Alle Dateien die keine Bilder sind werden mit Icons
nach Dateityp versehen (Audio, Video, PDF, sonstige Formate)
- Dateitypen wie Bilder, Audio, Video erhalten eine
Doppelklick Funktion um die Datei anzuzeigen andere
Dateitypen sind von der Anzeige ausgeschlossen
***********************************************************/
function get_master_folder_contents_success(data) {
	var content = document.getElementById("content");
	content.innerHTML = "";
	for(let i = 0; i < data.length; i++) {
		var data_block = document.createElement("div");
		data_block.setAttribute("class", "data-view");
		data_block.setAttribute("title", "Name: "+data[i]["NAME_O"]+"\nDateityp: "+data[i]["TYPE"].toUpperCase()+"\nGröße: "+fsize(data[i]["SIZE"])+"\nErstellzeit: "+data[i]["CREATION_DATE"]);
		data_block.setAttribute("id", "file-"+data[i]["ID"]);
		data_block.setAttribute("oncontextmenu", "show_context_menue("+data[i]["ID"]+", '"+data[i]["NAME_O"]+"', '"+data[i]["NAME_S"].substring(1)+"', '"+data[i]["TYPE"]+"')");
		var wrap = document.createElement("div");
		wrap.setAttribute("class", "data-view-wrap");
		var img = document.createElement("img");
		img.setAttribute("class", "data-view-preview");
		if(data[i]["TYPE"].toUpperCase() == "PNG" || data[i]["TYPE"].toUpperCase() == "JPG" || data[i]["TYPE"].toUpperCase() == "JPEG" || data[i]["TYPE"].toUpperCase() == "GIF" || data[i]["TYPE"].toUpperCase() == "WEBP") {
			data_block.setAttribute("ondblclick", "show_image('"+data[i]["NAME_S"].substring(1)+"')");
			img.setAttribute("src", data[i]["NAME_S"].substring(1));
		} else if(data[i]["TYPE"].toUpperCase() == "MP3" || data[i]["TYPE"].toUpperCase() == "WAV" || data[i]["TYPE"].toUpperCase() == "WMA" || data[i]["TYPE"].toUpperCase() == "FLAC" || data[i]["TYPE"].toUpperCase() == "OGG") {
			data_block.setAttribute("ondblclick", "show_audio('"+data[i]["NAME_S"].substring(1)+"', '"+data[i]["NAME_O"]+"')");
			img.setAttribute("src", "./images/audio_1.png");
		} else if(data[i]["TYPE"].toUpperCase() == "MP4" || data[i]["TYPE"].toUpperCase() == "WEBM" || data[i]["TYPE"].toUpperCase() == "AVI") {
			data_block.setAttribute("ondblclick", "show_video('"+data[i]["NAME_S"].substring(1)+"')");
			img.setAttribute("src", "./images/video_1.png");
		} else if(data[i]["TYPE"].toUpperCase() == "PDF") {
			data_block.setAttribute("ondblclick", "show_pdf('"+data[i]["NAME_S"].substring(1)+"')");
			img.setAttribute("src", "./images/pdf_1.png");
		} else {
			img.setAttribute("src", "./images/file_1.png");
		}
		wrap.appendChild(img);
		data_block.appendChild(wrap);
		var name = document.createElement("div");
		name.setAttribute("class", "data-view-name");
		name.innerText = data[i]["NAME_O"]+"."+data[i]["TYPE"];
		data_block.appendChild(name);
		content.appendChild(data_block);
		show_context_false(data_block);
	}
	msg_off();
};

/***********************************************************
Datei Anzeige öffnen und schließen Button erzeugen
***********************************************************/
function generate_box() {
	var box = document.getElementById("view-box");
	box.classList.add("flex");
	var close = document.createElement("img");
	close.setAttribute("class", "view-close");
	close.setAttribute("src", "./images/close_2.png");
	close.setAttribute("title", "Schließen");
	close.setAttribute("alt", "Schließen");
	close.setAttribute("onclick", "show_close()");
	box.appendChild(close);
	return box;
};

/***********************************************************
Datei Anzeige schließen
***********************************************************/
function show_close() {
	var box = document.getElementById("view-box");
	box.classList.remove("flex");
	box.innerHTML = "";
};

/***********************************************************
Musik Abspielen
- Wenn bereits ein Audio läuft pausiere und entferne
Fortschrittsbalken Interval
- Spiele Audio Datei ab und setze Intervall für die aktualisierung
des Fortschrittbalkens
- Tausche Play/Pause Button
***********************************************************/
function play() {
	var player = document.getElementById("audio");
	if(!player.paused) {
		player.pause();
		document.getElementById("pause").classList.add("none");
		document.getElementById("play").classList.remove("none");
		clearInterval(window.duration);
	}
	document.getElementById("play").classList.add("none");
	document.getElementById("pause").classList.remove("none");
	player.load();
	player.play();
	window.duration = setInterval("duration_update()", 1000);
};

/***********************************************************
Musik pausieren
- Entferne Fortschrittsbalken Interval
- Tausche Play/Pause Button
***********************************************************/
function pause() {
	var player = document.getElementById("audio");
	player.pause();
	clearInterval(window.duration);
	document.getElementById("pause").classList.add("none");
	document.getElementById("play").classList.remove("none");
};

/***********************************************************
Fortschrittsbalken (update)
***********************************************************/
function duration_update() {
	var file = document.getElementById("audio");
	var barSize = document.getElementById("player-duration-box").offsetWidth;
	document.getElementById("duration").style.width = (parseInt(file.currentTime*(barSize)/file.duration))+"px";
	if(file.ended) {
		file.currentTime = 0;
		document.getElementById("duration").style.width = "0px";
		pause();
	}
};

/***********************************************************
Fortschrittsbalken vor-/zurückspulen
***********************************************************/
function duration_progress() {
	var barSize = document.getElementById("player-duration-box").offsetWidth;
	if(!document.getElementById("audio").ended) {
		var file = document.getElementById("audio");
		var mouseX = event.pageX-barSize-(barSize/7);
		var newtime = mouseX*file.duration/barSize;
		file.currentTime = newtime;
		document.getElementById("duration").style.width = mouseX + "px";
	} else {
		file.currentTime = 0;
		document.getElementById("duration").style.width = "0px";
		pause();
	}
};

/***********************************************************
Anzeigen eines Bilds (nach Doppelklick)
***********************************************************/
function show_image(file) {
	var box = generate_box();
	var img = document.createElement("img");
	img.setAttribute("class", "view-img");
	img.setAttribute("src", file);
	box.appendChild(img);
};

/***********************************************************
Anzeigen des Audioplayers (nach Doppelklick)
- Play Button
- Pause Button
- Fortschrittsbalken
***********************************************************/
function show_audio(file, name) {
	var box = generate_box();
	var container = document.createElement("div");
	container.setAttribute("class", "view-player-main");
	var file_title = document.createElement("div");
	file_title.setAttribute("class", "view-player-title");
	file_title.setAttribute("title", name);
	file_title.innerText = name;
	var track = document.createElement("div");
	track.setAttribute("class", "view-player-track");
	var audio_file = document.createElement("audio");
	audio_file.setAttribute("src", file);
	audio_file.setAttribute("id", "audio");
	track.appendChild(audio_file);
	var btn_box = document.createElement("div");
	btn_box.setAttribute("class", "masked-box");
	var btn_play = document.createElement("img");
	btn_play.setAttribute("class", "masked-image");
	btn_play.setAttribute("src", "./images/play_1.png");
	btn_play.setAttribute("alt", "Play");
	btn_play.setAttribute("title", "Abspielen");
	btn_play.setAttribute("id", "play");
	btn_play.setAttribute("onclick", "play()");
	btn_box.appendChild(btn_play);
	var btn_pause = document.createElement("img");
	btn_pause.setAttribute("class", "masked-image none");
	btn_pause.setAttribute("src", "./images/pause_1.png");
	btn_pause.setAttribute("alt", "Play");
	btn_pause.setAttribute("title", "Abspielen");
	btn_pause.setAttribute("id", "pause");
	btn_pause.setAttribute("onclick", "pause()");
	btn_box.appendChild(btn_pause);
	track.appendChild(btn_box);
	var duration_box = document.createElement("div");
	duration_box.setAttribute("class", "player-duration-box");
	duration_box.setAttribute("id", "player-duration-box");
	duration_box.setAttribute("onclick", "duration_progress()");
	var duration_line = document.createElement("div");
	duration_line.setAttribute("class", "player-duration-line");
	duration_line.setAttribute("id", "duration");
	duration_box.appendChild(duration_line);
	track.appendChild(duration_box);
	container.appendChild(file_title);
	container.appendChild(track);
	box.appendChild(container);
};

/***********************************************************
Anzeigen eines Videos (HTML5 Player) (nach Doppelklick)
***********************************************************/
function show_video(file) {
	var box = generate_box();
	var video = document.createElement("video");
	video.setAttribute("class", "view-video");
	video.setAttribute("controls", "");
	var video_src = document.createElement("source");
	video_src.setAttribute("src", file);
	video.appendChild(video_src);
	box.appendChild(video);
};

/***********************************************************
Anzeigen einer PDF Datei in Iframe (nach Doppelklick)
***********************************************************/
function show_pdf(file) {
	var box = generate_box();
	var pdf = document.createElement("iframe");
	pdf.setAttribute("class", "view-pdf");
	pdf.setAttribute("src", file);
	box.appendChild(pdf);
};

/***********************************************************
Nachrichtenbox aufruf Datei umbenennen (Kontextmenü Button)
***********************************************************/
function ask_rename_file(id, name) {
	closeContext();
	var type = "Error";
	var title = "Datei umbenennen";
	var body = '<label class="label-msg font-100">Neuer Dateiname:</label>';
	body += '<input type="text" class="input-msg font-100" name="file-name" placeholder="Dateiname..." title="Bitte geben Sie einen Dateinamen ein" autocomplete="off" value="'+name+'">';
	var buttons = Array();
	buttons.push("Speichern");
	buttons.push("Abbrechen");
	var button_fu = Array();
	button_fu.push("rename_file("+id+")");
	button_fu.push("msg_off()");
	msg_on(type, title, body, buttons, button_fu);
};

/***********************************************************
Nachrichtenbox Datei umbenennen nach klick auf speichern
in der Datenbank umbenennen
***********************************************************/
function rename_file(id) {
	var name = document.getElementsByName("file-name")[0].value;
	load("Speichere neuen Dateinamen...");
	var data = new FormData();
	data.append("save", 1);
	data.append("id", id);
	data.append("name", name);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "rename_file_success";
	fu[0][1] = 1;
	fu[0][2] = id;
	main_backend_request("./scripts/edit_file_name", fu, data);
};

/***********************************************************
Nachrichtenbox Datei umbenennen nach dem speichern in der
Datenbank
- Benachrichtigung erfogreich gespeichert
- Angezeigte Datei im HTML Dokument umbennen
***********************************************************/
function rename_file_success(id, data) {
	document.getElementById("file-"+id).childNodes[1].innerText = data["NAME_O"]+"."+data["TYPE"];
	save("Neuer Dateiname erfolgreich gespeichert");
	setTimeout(function () { msg_off(); }, 3000);
};

/***********************************************************
Herunterladen einer Datei (Kontextmenü Button)
- Datei in JavaScript laden
- Dateinamen ändern (Serverdateiname zu Anzeigename)
- Datei ohne Popup/Neune Tab herunterladen
***********************************************************/
async function download_file(name, path, type) {
	closeContext();
	const response = await fetch(new URL(path , document.baseURI).href)
	if(!response.ok) {
		return;
	}
	const blob = await response.blob();
	var reader = new FileReader();
	reader.readAsDataURL(blob); 
	reader.onloadend = function() {
		var base64data = reader.result;
		const a = document.createElement('a');
		a.style.display = 'none';
		document.body.appendChild(a);
		a.href = base64data;
		a.download = name+"."+type;
		a.click();
		document.body.removeChild(a);
	}
};

/***********************************************************
Nachrichtenbox entfernen einer Datei (Kontextmenü Button)
***********************************************************/
function ask_remove_file(id, name) {
	closeContext();
	var type = "Error";
	var title = "Datei entfernen";
	var body = 'Sind Sie sicher, das Sie die Datei <span class="bold color-5">'+name+' entfernen</span> möchten?';
	var buttons = Array();
	buttons.push("Entfernen");
	buttons.push("Abbrechen");
	var button_fu = Array();
	button_fu.push("remove_file("+id+")");
	button_fu.push("msg_off()");
	msg_on(type, title, body, buttons, button_fu);
};

/***********************************************************
Datei von der Datenbank und aus dem Verzeichnis entfernen
***********************************************************/
function remove_file(id) {
	load("Entferne Datei...");
	var data = new FormData();
	data.append("remove", 1);
	data.append("id", id);
	var fu = Array();
	fu[0] = Array();
	fu[0][0] = "remove_file_success";
	fu[0][1] = 1;
	fu[0][2] = id;
	main_backend_request("./scripts/remove_file", fu, data);
};

/***********************************************************
Meldung Datei erforgreich entfernt und das HTML Element
der Datei entfernen
***********************************************************/
function remove_file_success(id, data) {
	document.getElementById("file-"+id).parentNode.removeChild(document.getElementById("file-"+id));
	save("Datei erfolgreich entfernt");
	setTimeout(function () { msg_off(); }, 3000);
};

/***********************************************************
Kontextmenü Anzeige/Funktionsaufrufe
- Datei Umbenennen
- Datei Herunterladen
- Datei entfernen
***********************************************************/
function show_context_menue(id, name, path, type) {
	var msg_box = document.getElementById("msg-box");
	msg_box.setAttribute("class", "context-menue");
	msg_box.setAttribute("style", "z-index: 999;");
	msg_box.innerHTML = "";
	msg_box.style.left = window.x-msg_box.offsetWidth+"px";
	msg_box.style.top = window.y+"px";
	var menue_1 = document.createElement("div");
	menue_1.setAttribute("class", "context-item");
	menue_1.setAttribute("onclick", "ask_rename_file("+id+", '"+name+"')");
	menue_1.innerText = "Umbenennen";
	msg_box.appendChild(menue_1);
	var menue_2 = document.createElement("div");
	menue_2.setAttribute("class", "context-item");
	menue_2.setAttribute("onclick", "download_file('"+name+"', '"+path+"', '"+type+"')");
	menue_2.innerText = "Herunterladen";
	msg_box.appendChild(menue_2);
	var menue_3 = document.createElement("div");
	menue_3.setAttribute("class", "context-item");
	menue_3.setAttribute("onclick", "ask_remove_file("+id+", '"+name+"')");
	menue_3.innerText = "Entfernen";
	msg_box.appendChild(menue_3);
};

/***********************************************************
Kontextmenü schließen
***********************************************************/
function closeContext() {
	msg_box = document.getElementById("msg-box");
	if(msg_box.classList.contains("context-menue")) {
		msg_box.classList.remove("context-menue");
		msg_box.classList.add("msg-box");
		msg_box.removeAttribute("style");
		msg_box.innerHTML = "";
	}
};

/***********************************************************
Mauszeigerbewegung
***********************************************************/
function onMouseUpdate(e) {
	window.x = e.pageX;
	window.y = e.pageY;
};

/***********************************************************
Rechtsklick Aufruf das das Standard Kontextmenü nicht
auftaucht
***********************************************************/
function show_context_false(elem) {
	elem.addEventListener('contextmenu', function(e) {
		e.preventDefault();
	}, false);
};

/***********************************************************
Verhindern, dass das Browser Kontextmenü erscheint bei
Rechtsklick auf eine Angezeigten Datei
***********************************************************/
function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
};

/***********************************************************
Drag & Drop Bereich anzeigen (nur wenn ein Verzeichnis
gewählt ist)
***********************************************************/
function highlight(e) {
	if(window.selected_master_folder != null) {
		document.getElementById("drag-drop").classList.add('flex');
	}
};

/***********************************************************
Drag & Drop Bereich ausblenden
***********************************************************/
function unhighlight(e) {
	document.getElementById("drag-drop").classList.remove('flex');
};

/***********************************************************
Die abgelegten Dateien als HTML Elemente anzeigen
- Öffnen der Warteschlange (HTML)
- Icons der Dateien Anzeigen
- Upload starten 
***********************************************************/
function upload_files(data_files) {
	if(window.selected_master_folder != null) {
		var data = data_files.dataTransfer;
		var files = data.files;
		window.tmp_files = Array.from(files);
		var upload_box = document.getElementById("upload-process");
		upload_box.classList.add("flex");
		var content = document.getElementById("content");
		content.setAttribute("style", "max-height: calc(100% - 3.25rem);");
		for(let i = 0; i < window.tmp_files.length; i++) {
			var comp = window.tmp_files[i]["type"].split("/");
			var upload_item = document.createElement("div");
			upload_item.setAttribute("class", "upload-item");
			upload_item.setAttribute("title", "Entfernen");
			var upload_img = document.createElement("img");
			upload_img.setAttribute("class", "upload-icon");
			if(comp[1].toUpperCase() == "PNG" || comp[1].toUpperCase() == "JPG" || comp[1].toUpperCase() == "JPEG" || comp[1].toUpperCase() == "GIF" || comp[1].toUpperCase() == "WEBP") {
				upload_img.setAttribute("src", "./images/image_1.png");
			} else if(comp[1].toUpperCase() == "MP3" || comp[1].toUpperCase() == "WAV" || comp[1].toUpperCase() == "WMA" || comp[1].toUpperCase() == "FLAC" || comp[1].toUpperCase() == "OGG") {
				upload_img.setAttribute("src", "./images/audio_1.png");
			} else if(comp[1].toUpperCase() == "MP4" || comp[1].toUpperCase() == "WEBM" || comp[1].toUpperCase() == "AVI") {
				upload_img.setAttribute("src", "./images/video_1.png");
			} else if(comp[1].toUpperCase() == "PDF") {
				upload_img.setAttribute("src", "./images/pdf_1.png");
			} else {
				upload_img.setAttribute("src", "./images/file_1.png");
			}
			upload_item.appendChild(upload_img);
			upload_box.appendChild(upload_item);
			window.tmp_files_folder.push(window.selected_master_folder);
		}
		upload_process();
	}
};

/***********************************************************
Datei auf dem Server ablegen und in der Datenbank speichern
***********************************************************/
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

/***********************************************************
Nach Ablage einer Datei auf dem Server prüfen ob sich
andere Dateien in der Warteschlange befinden, wenn sich noch
Dateien in der Warteschlange befinden starte den Upload für
die nächste Datei, wenn nicht schließe den Upload Bereich
***********************************************************/
function upload_process_success(data) {
	if(parseInt(data["FID"]) == parseInt(window.selected_master_folder)) {
		build_data_view(data);
	}
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

/***********************************************************
Das erste Element des Uploads farbig markieren (aktuell
aktiver upload)
***********************************************************/
function set_active_upload() {
	var upload_box = document.getElementById("upload-process");
	upload_box.firstChild.classList.add("active-upload");
};

/***********************************************************
Datei im Ordner Anzeigen nach dem Upload:
- Prüfen ob das gerade angezeigte Hauptverzeichnis dem
Upload Verzeichnis entspricht
- Trifft die erste Bedingung zu erstelle die Miniaturansicht
- Siehe get_master_folder_contents_success() für weitere
Angaben
***********************************************************/
function build_data_view(data) {
	var content = document.getElementById("content");
	var data_block = document.createElement("div");
	data_block.setAttribute("class", "data-view");
	data_block.setAttribute("title", "Name: "+data["NAME_O"]+"\nDateityp: "+data["TYPE"].toUpperCase()+"\nGröße: "+fsize(data["SIZE"])+"\nErstellzeit: "+data["CREATION_DATE"]);
	data_block.setAttribute("id", "file-"+data["ID"]);
	data_block.setAttribute("oncontextmenu", "show_context_menue("+data["ID"]+", '"+data["NAME_O"]+"', '"+data["NAME_S"].substring(1)+"', '"+data["TYPE"]+"')");
	var wrap = document.createElement("div");
	wrap.setAttribute("class", "data-view-wrap");
	var img = document.createElement("img");
	img.setAttribute("class", "data-view-preview");
	if(data["TYPE"].toUpperCase() == "PNG" || data["TYPE"].toUpperCase() == "JPG" || data["TYPE"].toUpperCase() == "JPEG" || data["TYPE"].toUpperCase() == "GIF" || data["TYPE"].toUpperCase() == "WEBP") {
		data_block.setAttribute("ondblclick", "show_image('"+data["NAME_S"].substring(1)+"')");
		img.setAttribute("src", data["NAME_S"].substring(1));
	} else if(data["TYPE"].toUpperCase() == "MP3" || data["TYPE"].toUpperCase() == "WAV" || data["TYPE"].toUpperCase() == "WMA" || data["TYPE"].toUpperCase() == "FLAC" || data["TYPE"].toUpperCase() == "OGG") {
		data_block.setAttribute("ondblclick", "show_audio('"+data["NAME_S"].substring(1)+"', '"+data["NAME_O"]+"')");
		img.setAttribute("src", "./images/audio_1.png");
	} else if(data["TYPE"].toUpperCase() == "MP4" || data["TYPE"].toUpperCase() == "WEBM" || data["TYPE"].toUpperCase() == "AVI") {
		data_block.setAttribute("ondblclick", "show_video('"+data["NAME_S"].substring(1)+"')");
		img.setAttribute("src", "./images/video_1.png");
	} else if(data["TYPE"].toUpperCase() == "PDF") {
		data_block.setAttribute("ondblclick", "show_pdf('"+data["NAME_S"].substring(1)+"')");
		img.setAttribute("src", "./images/pdf_1.png");
	} else {
		img.setAttribute("src", "./images/file_1.png");
	}
	wrap.appendChild(img);
	data_block.appendChild(wrap);
	var name = document.createElement("div");
	name.setAttribute("class", "data-view-name");
	name.innerText = data["NAME_O"]+"."+data["TYPE"];
	data_block.appendChild(name);
	content.appendChild(data_block);
	show_context_false(data_block);
};