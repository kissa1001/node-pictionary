var pictionary = function() {
    //variales
    var canvas, context;
    var drawing = false;
    var guessBox;
    var socket = io();
    var drawer;
    var clearButton = $('#clear');
    guessBlock = $('.guess-block');
    makeGuess = $('#guess');
    guessList = $('#guess-list');
    claimButton = $('#claim').find('button');
    wordToDraw = $('#word');
    systemMsg = $('#system');
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
    //Draw function
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };

    // function to listen for key presses in the input
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { 
            return;
        }
        var guess = guessBox.val();
        socket.emit('guess', guess);
        guessBox.val('');
    };
    guessBox = $('#guess input');
    guessBox.on('keydown', onKeyDown);

    //canvas
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    //Listen for the mousedown event
    canvas.on('mousedown', function() {
        if(drawer){
            drawing = true;
        }
    });
    //Listen for the mouseup event
    canvas.on('mouseup', function(){
        drawing = false;
    });

    canvas.on('mousemove', function(event) {
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        //Only perform the mousemove actions when drawing is set to true
        if(drawing){
            draw(position);
            socket.emit('draw', position);
        }
    });
    //Listen for the broadcast draw event and call the draw function when it is received
    socket.on('draw', function(position) {
        draw(position);
    });
    //Listen for the broadcast guess event
    socket.on('guess', function(guess){
        if(WORDS.includes(guess)){
            socket.emit('won', guess);
            guessList.text(guess + ' is correct answer!');
            claimButton.show();
            makeGuess.hide();
            wordToDraw.hide();
        }
        else{
            var guesses = guessList.text();
            guessList.text(guesses + guess + ', ');
        }
    });

    //Clear canvas
    clearButton.on('click', function(){
        context.clearRect(0,0, canvas[0].width, canvas[0].height);
    });

    //Who is drawing?
    claimButton.on('click', function() {
        socket.emit('claim pen');
        claimButton.hide();
        guessBlock.show();
    });

    socket.on('pen claimed', function() {
        claimButton.hide();
        guessBlock.show();
    });

    socket.on('pen open', function() {
        claimButton.show();
    });

    socket.on('drawer', function(word) {
        drawer = true;
        wordToDraw.append('<div>You\'re the drawer. Draw a <span id="secretWord">' + word + '</span>!</div>').css('display', 'block');
        $('#guess').hide();
    });

};



$(document).ready(function() {
    pictionary();
});