var debug_mode = false;

function msg_off() {
	var conf_box = document.getElementById("config-box");
	if(conf_box.classList.contains("flex")) {
		conf_box.classList.remove("flex");
		conf_box.innerHTML = "";
	}
};

function msg_on(type, title, body, buttons, button_fu) {
	var conf_box = document.getElementById("config-box");
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
	var conf_box = document.getElementById("config-box");
	if(conf_box.classList.contains("flex")) {
		conf_box.classList.remove("flex");
		conf_box.innerHTML = "";
	}
	var load_box = document.createElement("div");
	load_box.setAttribute("class", "load-box");
	var load_img = document.createElement("img");
	load_img.setAttribute("class", "load-circle");
	load_img.setAttribute("src", "../../images/load.png");
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
	var conf_box = document.getElementById("config-box");
	if(conf_box.classList.contains("flex")) {
		msg_off();
		save(msg);
		return;
	}
	var save_box = document.createElement("div");
	save_box.setAttribute("class", "save-box");
	var save_img = document.createElement("img");
	save_img.setAttribute("class", "save-anim");
	save_img.setAttribute("src", "../../images/bestaetigt.png");
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
		url: "../"+script+".php",
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