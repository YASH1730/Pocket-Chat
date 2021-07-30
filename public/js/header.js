const socket = io();
const audio = new Audio("../public/tune/not.mp3")



function preback (){
  window.history.forward();
}

window.onunload= function (){null};

const name = document.getElementById("name90")

// console.log(name.innerText)

socket.emit("UserName", name.innerText);

// socket.on("status",(data)=>{
//   alert(data)
// })

socket.on("Massage", (data) => {
  audio.play();
      alert(`${data.name} is sending u a massage !!!`)
});

socket.on("leave", (msg) => {
  audio.play();
    alert(msg)
  });
  
  

// console.log("Yashwant")
