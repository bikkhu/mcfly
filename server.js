/************************************************************************************************************
*
*	Formato de las notas:
*	{	"timestamp":date in full JavaScript format,
*		"author":string,
*		"content":string shorter than 140 char,
*		"favs": {
*			"fav_count":integer,
*			"fav_users": [
*				"user1",
*				"user2",
*				"user3"	
*			]
*		}
*	}
/************************************************************************************************************
*
*	Estructura del sistema de almacenamiento
*		{"authors":["author1","author2","author3",...], (array que contiene los autores publicados)
*		"notes":[json of note 1, json of note 2, ...]} (array que contiene las notas existentes)
*
*************************************************************************************************************
*
*	Formato de las peticiones (todas las notas están en el formato anterior):
*	- llamar al API para crear notas:
*		POST con carga: {"user":string, "action":"write", "note":nota}
*		(los tres primeros campos de la nota llegarán completos o la nota no se guardará).
*	- llamar al API para consultar las notas:
*		POST con carga: {"user":string, "action":"read_all", "note":nota}
*		(el único campo de la nota que tiene que estar especificado es el autor que se desea consultar)
*	- llamar al API para consultar una sola nota
*		POST con carga: {"user":string, "action":"read_one", "note":nota}
*		(los dos únicos campos de la nota que tienen que estar especificados es el autor y el timestamp)
*	- llamar al API para marcar como favorita una nota:
*		POST con carga: {"user":string, "action":"fav", "note":nota}
*		(los dos únicos campos de la nota que tienen que estar especificados son el autor y el timestamp)
*	- llamar al API para consultar las notas marcadas como favoritas:
*		POST con carga: {"user":string, "action":"get_favs", "note":nota}
*		(ningún requerimiento relativo al contenido de la nota)
*
*************************************************************************************************************/

// imports
var http = require('http');
var fs = require('fs'); 

//global variables declaration
var json_file = JSON.parse(fs.readFileSync('./logfile.json'));
var authors_array = json_file.authors;
var notes_array = json_file.notes;
var server = http.createServer();

server.on('request', control);
server.listen(8080);

setInterval(close_sys, 100000);

function control(req, res) {
	req.on('data', function(chunk){
		console.log('\x1Bc');
		var payload = JSON.parse(chunk);
		if ((req.method == 'POST') && (payload.action == 'write')) {
		/*	llamar al API para crear notas:
		*	POST con carga: {"user":string, "action":"write", "note":nota}
		*	(los tres primeros campos de la nota llegarán completos o la nota no se guardará).
		*/	if ((payload.user == payload.note.author) && (check_content(payload.note.content))) {
				save_note(payload.note);
				res.writeHead(200, "OK", {'Content-Type': 'text'});
			} else {
				res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
			}
		} else if ((req.method == 'POST') && (payload.action == 'read_all')) {
		/*	llamar al API para consultar las notas:
		*	POST con carga: {"user":string, "action":"read_all", "note":nota}
		*	(el único campo de la nota que tiene que estar especificado es el autor que se desea consultar)
		*/	if (check_author(payload.note.author)) {
				res.writeHead(200, "OK", {'Content-Type': 'text'});
				res.write(JSON.stringify(get_notes_by_author(payload.note.author)));
			} else {
				res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
			}
		} else if ((req.method == 'POST') && (payload.action == 'read_one')) {
		/*	llamar al API para consultar una sola nota
		*	POST con carga: {"user":string, "action":"read_one", "note":nota}
		*	(los dos únicos campos de la nota que tienen que estar especificados es el autor y el timestamp)
		*/	if (check_author(payload.note.author) && (check_timestamp(payload.note.timestamp))) {
				res.writeHead(200, "OK", {'Content-Type': 'text'});
				res.write(JSON.stringify(get_notes_by_author(payload.note.author, payload.note.timestamp)));
			} else {
				res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
			}
		} else if ((req.method == 'POST') && (payload.action == 'fav')) {
		/*	llamar al API para marcar como favorita una nota:
		*	POST con carga: {"user":string, "action":"fav", "note":nota}
		*	(los dos únicos campos de la nota que tienen que estar especificados son el autor y el timestamp)
		*/	if (check_author(payload.note.author) && (check_timestamp(payload.note.timestamp))) {
				fav(payload.user, payload.note);
				res.writeHead(200, "OK", {'Content-Type': 'text'});
			} else {
				res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
			}
		} else if ((req.method == 'POST') && (payload.action == 'get_favs')) {
		/*	llamar al API para consultar las notas marcadas como favoritas:
		*	POST con carga: {"user":string, "action":"get_favs", "note":nota}
		*	(ningún requerimiento relativo al contenido de la nota)
		*/	if (check_author(payload.note.author) && (check_timestamp(payload.note.timestamp))) {
				res.writeHead(200, "OK", {'Content-Type': 'text'});
				console.log("returning: "+JSON.stringify(get_notes_by_favs(payload.user)));
				res.write(JSON.stringify(get_notes_by_favs(payload.user)));
			} else {
				res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
			}
		} else {
			//	llamada incorrecta
			res.writeHead(400, "BAD REQUEST", {'Content-Type': 'text'});
		}
		res.addTrailers('Access-Control-Allow-Origin', '*');
	    res.addTrailers('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
	    res.addTrailers('Access-Control-Allow-Credentials', false);
	    res.addTrailers('Access-Control-Max-Age', '86400');
	    res.addTrailers('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
		res.end()
	});
}

function check_timestamp(timestamp) {
	try {
		var d = Date.parse(timestamp);
		return true;
	}
	catch (err) {
		return false;
	}
}

function check_content(content) {
	if (typeof content === 'string' || content instanceof String)
		if (content.length <= 140)
			return true;
	else return false;
}

function check_author(author) {
	var exists = false;
	for (var i=0; i<authors_array.length; i++) exists = exists || (author == authors_array[i]);
	return exists;
}

function get_notes(kind_of_param, param, notes_array) {
 	var filtered_array = new Array();
 	switch (kind_of_param) {
 		case "timestamp":
 			for (var j=0; j<notes_array.length; j++) {
 				var note = notes_array[j];
 				if (note.timestamp == param)
 					filtered_array.push(note);
 			}
 			break;
 		case "author":
 			for (var j=0; j<notes_array.length; j++) {
 				var note = notes_array[j];
 				if (note.author == param)
 					filtered_array.push(note);
 			}
 			break;
 		case "content":
 			for (var j=0; j<notes_array.length; j++) {
 				var note = notes_array[j];
 				if (note.content == param)
 					filtered_array.push(note);
 			}
 			break;
 		case "faved":
 			for (var j=0; j<notes_array.length; j++) {
 				var note = notes_array[j];
 				for (var i=0; i<note.favs.fav_users.length; i++)
 					if (note.favs.fav_users[i] == param)
 						filtered_array.push(note);
 			}
 			break;
 		default:
 			break;
 	}
 	return filtered_array;
 }

function get_notes_by_author(author, timestamp) {
	var filt_notes = notes_array.slice();
	if (check_author(author)) {
		switch (arguments.length) {
			case 2:
				filt_notes = get_notes("timestamp", timestamp, filt_notes);
			case 1:
				filt_notes = get_notes("author", author, filt_notes);
				break;
			default:
				return null;
		}
		return filt_notes;
	}
}

function get_notes_by_favs(user) {
	return get_notes("faved", user, notes_array);
}

function save_note(note) {
	note.timestamp = Date.now();
	notes_array.push(note);
	if (!check_author(note.author)) authors_array.push(note.author);
}

function fav(user, note) {
	var array = new Array();
	for (var j=0; j<notes_array.length; j++) {
		var note_element = notes_array[j];
		if (note_element.timestamp == note.timestamp) {
			if (note_element.author == note.author) {
				var already_faved = false;
				for (var i=0; i<note_element.favs.fav_users.length; i++) already_faved = already_faved || (note_element.favs.fav_users[i] == user);
				if (!already_faved) {
					note_element.favs.fav_users.push(user);
					note_element.favs.fav_count++;
				}
			}
		}
	}
}

function update_log() {
	fs.writeFileSync('./logfile.json', JSON.stringify({"authors":authors_array, "notes":notes_array}));
}