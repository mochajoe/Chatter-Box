var app = {};
app.username = 'George Washington';
app.roomname = 'lobby';
app.server = 'http://parse.hrr.hackreactor.com/chatterbox/classes/messages'
app.friends = {};

app.init = function() {

    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$rooms = $('#rooms');
    app.$roomSelect = $('#roomSelect');
    app.$submit = $('.submit');
    app.$send = $('#send');

    //set room handler
    app.$roomSelect.on('change',app.changeRoom);
    //set submit handler
    app.$send.on('submit',app.handleSubmit)
    //event listener for handle username click;
    app.$chats.on('click', '.username', app.handleUsernameClick) //event delgation, propagates all the way to the root dom, because, 'username is not available on DOM load.

    //retrieve the data
    // app.fetch();

    //we should set an interval
    setInterval(app.fetch(),3000);
};


app.fetch = function() {
    $.ajax({
        // This is the url you should use to communicate with the parse API server.
        url: app.server,
        type: 'GET',
        data: {
            order: '-createdAt'
        },
        success: function(data) {

            app.renderMessages(data.results);
            app.renderRooms(data.results);

            console.log(data)
        },
        error: function(data) {
            // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
            console.error('chatterbox: Failed to send message', data);
        }
    });
};

app.renderMessages = function(messages) {
    app.clearMessages();
    messages.forEach(app.renderMessage);
}


app.renderMessage = function(message) {
    // console.log(messages[99].username) //himanshu
    if (!message.roomname) {
        message.roomname = 'lobby';
    };
    //only add data in current room

    var messageObj = {};

    if(message.roomname === app.roomname) {

        if (message.text !== null && message.text !== undefined && message.username !== 'anonymous') {

            if(message.text.length > 0) {


            var $createNewMessageClass = $('<div class = "chat"> </div>');

            var $username = $('<span class= "username" />');
            $username
            .text(message.username)
            .attr('data-username', message.username)
            .appendTo($createNewMessageClass);

            if(app.friends[message.username] === true) {
                $username.addClass('friend');
            }

            var $message = $('<br><span/>');
            // $($message).appendTo($something);
            $message.text(message.text).appendTo($createNewMessageClass);

            app.$chats.append($createNewMessageClass);


            }
       }
    }
}


app.clearMessages = function() {
    app.$chats.empty();
}

app.send = function(message) {

     $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: app.server,
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function (data) {
        console.log('chatterbox: Message sent');
        app.$message.val('');
        app.fetch();

      },
      error: function (data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
    console.error('chatterbox: Failed to send message', data);
  }
});

}

app.renderRooms = function(data) {
    app.$roomSelect.html('<option value ="_newRoom">Please add a new room</option><option value ="" selected>lobby</option />');



    var rooms = {
        'lobby' : true
    };

    data.forEach(function(date){

        if (!rooms.hasOwnProperty(date.roomname)) {
          app.renderRoom(date.roomname);
          rooms[date.roomname] = true;

        }
    })
    app.$roomSelect.val(app.roomname);
}


app.renderRoom = function(roomname) {

    if(roomname.length < 14) {

    var $options = $('<option />').val(roomname).text(roomname);
    //add to the rooms div
    app.$roomSelect.append($options);


    }
    //create something for the rooms in the drop down
};

app.changeRoom = function() {

    //we need to set the global room to this
    // Somehow we need to take a variable and set it;
    console.log(this.value);

    app.roomname = this.value;
    app.fetch();
}

app.handleSubmit = function(event) {
    event.preventDefault(); //prevent, stops the page from refreshing on invokation.
    console.log(app.$message.val())
    var message = {
        roomname:  app.roomname || 'lobby',
        text: app.$message.val(),
        username: app.username,
    };

    app.send(message);

}

app.handleUsernameClick = function(event) {
    console.dir(event);
    var username = $(event.target).data('username');

    if(username !== undefined) {
        app.friends[username] = !app.friends[username];

        var selector = '[data-username="' + username.replace(/"/g, '\\\"' + '"]');
        var $usernames = $(selector).toggleClass('friend');
    }
}

