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
