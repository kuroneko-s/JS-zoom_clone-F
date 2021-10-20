const socket = io();

const welcome = document.getElementById("welcome");
const joinForm = document.getElementById("join");

const room = document.getElementById("room");
room.hidden = true;

let roomName = "";

const addMessage = (msg) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = msg;
  ul.appendChild(li);
};

const handleMessageSubmit = (e) => {
  e.preventDefault();
  const input = room.querySelector("input");
  let value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const showRoom = () => {
  room.hidden = false;
  welcome.hidden = true;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room name : ${roomName}`;

  const messageForm = room.querySelector("form");
  messageForm.addEventListener("submit", handleMessageSubmit);
};

const submitHandler = (e) => {
  e.preventDefault();
  const input = joinForm.querySelector("input:nth-child(1)");
  const input2 = joinForm.querySelector("input:nth-child(2)");

  roomName = input.value;

  socket.emit(
    "enter_room",
    {
      roomName,
      nickname: input2.value,
    },
    showRoom
  );

  input.value = "";
  input2.value = "";
};

joinForm.addEventListener("submit", submitHandler);

socket.on("welcome", (nickname, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} join!`);
});

socket.on("bye", (nicknamem, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${nickname} Good Bye`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerText = "";

  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.appendChild(li);
  });
});
