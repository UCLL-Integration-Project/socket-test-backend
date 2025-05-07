var syncword = "";

var buttonState = function (state = false) {
  $("#buttonState").text(
    state
    ? "pressed"
    : "released");
};

$(document).ready(function () {
  buttonState();

  $("#screenSyncword").on("click", "#syncwordButton", function (e) {
    e.preventDefault();
    $("#screenSyncword").hide();
    $("#screenActiveSyncword").show();

    syncword = $("#syncwordInput").val();
    console.log("Syncword set to:", syncword);
    socket.emit("joinRoom", syncword, function (message) {
      console.log("response:", message);
      socket.emit("textUpdate", {
        syncword: syncword,
        message: "join room: " + syncword
      });
    });

    socket.on("update", function (data) {
      console.log("Received data:", data);

      if (data && data.message != null) {
        $("#messageDisplay").text(data.message);
      }
      if (data && data.buttonState != null) {
        buttonState(data.buttonState);
      }
    });
  });

  $("#screenActiveSyncword").on("click", "#messageButton", function (e) {
    e.preventDefault();

    socket.emit("textUpdate", {
      syncword: syncword,
      message: $("#message").val()
    });
  });
});