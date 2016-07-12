var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var favicon = require('serve-favicon');
var path = require('path');
var app = express();
app.use(express.static('public'));
var server = http.Server(app);
var io = socket_io(server);

var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

var getWord = function(wordList) {
	var index = Math.floor(Math.random() * (wordList.length - 1));
	return wordList[index];
};
io.on('connection', function(socket){
	console.log('Connected');
	var word = getWord(WORDS);
	//Emit draw event
	socket.on('draw', function(position){
		//listen for the draw event, and broadcast it out to all other clients
		socket.broadcast.emit('draw', position);
	});

	//Broadcast the guess event 
	socket.on('guess', function(guess){
		socket.broadcast.emit('guess', guess);
		socket.emit('guess', guess);
	});
	//On guessed
	socket.on('won', function(guess){
		
	})
	//Broadcast who is drawing
	socket.on('claim pen', function(){
		socket.drawer = true;
		socket.emit('drawer', word);
		socket.broadcast.emit('pen claimed');
	});

	//Disconnect
	socket.on('disconnect', function() {
		if (socket.drawer) {
			console.log('A drawer disconnected');
			socket.broadcast.emit('pen open');
		} else {
			console.log('A guesser disconnected');
		}
	});
});
server.listen(8080);