function login(form) {
  form.preventDefault();

  // set the username at localStorage
  const username = form?.target?.username?.value?.trim();

  socket.emit("login", { username });
}

window.onload = function () {

  socket.emit("check.login", window?.localStorage?.getItem("id") || "0");

  socket.on("check.login", (logined) => {

    if (logined) {
      return window.location.replace("/");
    }

    document.querySelector(".loader").classList.add("d-none");
    document.querySelector("main").classList.remove("d-none");
  });

  socket.on("login", ({ id, username }) => {
    window?.localStorage?.setItem("id", id);
    window?.localStorage?.setItem("username", username);
    window.location.replace("/");
  });
  
};
