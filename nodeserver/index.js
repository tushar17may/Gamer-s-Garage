//node server which will handle socket io connections
const io = require('socket.io')(8000)

//user object
const users = {};

io.on('connection', socket => {
    
    socket.on('new-user-joined', name => {
        // console.log("new user", name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });

    
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });

    // if someone leaves the chat let others know
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    });

    /////////////// Win Events ////////////////////////
    socket.on('user-wins-SI', name => {
        // console.log("new user", name);
        users[socket.id] = name;
        socket.broadcast.emit('userWinsSI', name);
    });

    socket.on('user-wins-WAM', name => {
        // console.log("new user", name);
        users[socket.id] = name;
        socket.broadcast.emit( 'userWinsWAM',name );
    });
    
    socket.on('user-wins-MG', name => {
        // console.log("new user", name);
        users[socket.id] = name;
        socket.broadcast.emit( 'userWinsMG',name);
    });

})