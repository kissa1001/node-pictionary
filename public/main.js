var pictionary = function() {
    //variales
    var canvas, context;
    var drawing = false;
    var guessBox;
    var socket = io();
    var drawer;
    var clearButton = $('#clear');
    guessList = $('#guess-list');
    claimButton = $('#claim').find('button');
    wordToDraw = $('#word');
    systemMsg = $('#system');
    
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
        var guesses = guessList.text();
        guessList.text(guesses + guess + ', ');
    });

    //Clear canvas
    clearButton.on('click', function(){
        context.clearRect(0,0, canvas[0].width, canvas[0].height);
    });

    //Who is drawing?
    claimButton.on('click', function() {
        socket.emit('claim pen');
        claimButton.hide();
    });

    socket.on('pen claimed', function() {
        claimButton.hide();
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