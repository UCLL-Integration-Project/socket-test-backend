var express = require("express");
const bodyParser = require("body-parser");
let path = require("path");
var fs = require("fs");

var helpers = require("./helpers");
const {serialize} = require("v8");

require("dotenv").config();

let app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

var http = require("http").createServer(app);
var io = require("socket.io")(http);

io.on("connection", socket => {
  socket.join("some room");
});

io.on("connection", function (socket) {
  var connId = false;

  if (socket.conn) {
    connId = socket.conn.id;
  }

  var message = "a client connected: " + connId;
  helpers.logMessage("connect", message, connId);

  socket.on("disconnect", function (msg) {
    var message = "a client disconnected: " + connId;
    helpers.logMessage("disconnect", message, connId, msg);
  });

  socket.on("joinRoom", function (room, callback) {
    socket.join(room);
    var message = "a client joined room: " + room;
    helpers.logMessage("joinRoom", message, connId, room);
    if (callback) {
      callback(message);
    } else {
      socket.emit("response", message);
    }
  });

  socket.onAny((event, ...args) => {
    console.log(`Received event: ${event}`);
    console.log("With arguments:", args);

    var payload = args;

    try {
      if (helpers.isJSONStringObject(args)) {
        payload = JSON.parse(args);
      } else {
        payload = args[0];
      }

      if (payload && payload.syncword) {
        io.to(payload.syncword).emit("update", payload); // send to all clients in the room
      }

    } catch (e) {
      console.log("Error parsing JSON:", e);
      socket.emit(event, {message: "Error parsing message"}); // send error to sender
    }
  });
});

var port = process.env.PORT;

http.listen(port, function () {
  console.log("listening on *:" + port);
});