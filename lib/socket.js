const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);

io.on("connection", socket => {
  socket.on("pollArticles", clientId => {
    socket.join(clientId);

    // get all articles here and emit them back to the socket...
    let articles = [];
    socket.emit("articles", articles);
  });
});

// listen on a different port for now...
// need a way to establish this connection and tail changes to sqlite as new articles are published...

http.listen(5000);
