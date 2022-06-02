function getMessages(cb) {
  fetch("/chats").then(async (res) => {
    cb(await res.json());
  });
}

function messageFromBuilder({ username, msg, time }) {
  return `
        <div
            data-message="true"
            id="message-component-from"
            class="chat-bg rounded p-2 w-75 mb-2"
        >
            <div class="d-flex flex-row justify-content-between">
                <small class="text-muted">${username}</small>
                <small class="text-muted">${time}</small>
            </div>
            <p class="mb-0">${msg}</p>
        </div>
    `;
}

function messageToBuilder({ username, msg, time }) {
  return `
    <div
        data-message="true"
        id="message-component-to"
        class="bg-primary text-white rounded p-2 w-75 mb-2"
  >
    <div class="d-flex flex-row justify-content-between">
      <small class="text-white">${username}</small>
      <small>${time}</small>
    </div>
    <p class="mb-0">${msg}</p>
  </div>
    `;
}

socket.emit("check.login", window?.localStorage?.getItem("id") || "0");

socket.on("check.login", (logined) => {
  if (!logined) {
    return window.location.replace("/login");
  }

  document.querySelector(".loader").classList.add("d-none");
  document.querySelector("main").classList.remove("d-none");

  socket.emit("messages");

  socket.on("messages", (messages) => {
    if (messages?.length) {
      document.querySelector("#no-message-placeholder").remove();

      for (let msg of messages) {
        const isSender = msg.user.id === window.localStorage.getItem("id");

        if (isSender) {
          document.querySelector("#chat-container").innerHTML +=
            messageToBuilder({
              username: msg.user.username,
              msg: msg.msg,
              time: moment(msg.time).fromNow(),
            });
        } else {
          document.querySelector("#chat-container").innerHTML +=
            messageFromBuilder({
              username: msg.user.username,
              msg: msg.msg,
              time: moment(msg.time).fromNow(),
            });
        }
      }
    }
  });

  // on a single message
  socket.on("message", ({ user, time, msg }) => {
    document.querySelector("#chat-container").innerHTML += messageFromBuilder({
      username: user.username,
      msg,
      time: moment(time).fromNow(),
    });

    document.querySelector("#no-message-placeholder").remove();
  });
});

function emitMessage(form) {
  form.preventDefault();

  const msg = form?.target?.msg?.value?.trim();

  const user = {
    username: window.localStorage.getItem("username"),
    id: window.localStorage.getItem("id"),
  };

  socket.emit("message", { msg, user, time: Date.now() });

  // add the message to the dom

  document.querySelector("#chat-container").innerHTML += messageToBuilder({
    username: user.username,
    msg,
    time: moment(Date.now()).fromNow(),
  });

  document.querySelector("#no-message-placeholder").remove();
}

document.querySelector("#user").textContent =
  window.localStorage.getItem("username");

socket.on("online", (count) => {
  document.querySelector("#online-sockets").textContent = count;
});
