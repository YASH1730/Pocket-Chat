// emit === Means send to server
// on === listening the event

const display = document.getElementById("display");
const input = document.getElementById("msg");
const name = document.getElementById("name");
const select = document.getElementById("selection");
const selectBtn = document.getElementById("selectBtn");
const audio = new Audio("../public/tune/msgTune.mp3")
const Time = new Date();

const socket = io();

var reciver = "";

// to get the reciver name
selectBtn.addEventListener("click", () => {
  reciver = select.value;
  select.value = reciver;
  
  display.innerHTML = "";
  
  const data = {
    reciver: reciver,
    sender: name.innerText,
  };
  socket.emit("printMsg", data);
});

// to add the msg to the sender screen
const btn = document.getElementById("btn").addEventListener("click", (e) => {
  e.preventDefault();
  append("right");
});


//for appending the speech box in display

function append(postion) {
  if (input.value != " ") {
    const div = document.createElement("div");
    const p = document.createElement("p")
    const small = document.createElement("small")
    const br = document.createElement('br');
    div.classList.add(postion);
    p.innerText = input.value;
    small.innerText = Time.getHours() +":"+ Time.getMinutes()+":"+ Time.getSeconds()
    div.appendChild(p);
    div.appendChild(br);
    div.appendChild(small);
    display.appendChild(div);
    
    let data = { msg: input.value, reciver: reciver, name: name.innerText };
        // send the reciver id 
        socket.emit("recive", data);
        $(".emojionearea-editor").html('');
        scroll();
      } else {
        return;
      }
    }
    
 // for appending the recived msg
    const appendrecive = (msg, position) => {
      const div = document.createElement("div");
      const p = document.createElement("p")
      const small = document.createElement("small")
      const br = document.createElement('br');
    
      div.classList.add(position);
      small.innerText = Time.getHours() +":"+ Time.getMinutes()+":"+ Time.getSeconds()
      p.innerText = msg;
      div.appendChild(p);
      div.appendChild(br);
      div.appendChild(small);
      display.appendChild(div);

      scroll();
};

// for appending the massage history 

const appendMassages = (data) => {
  
  var position = "left";
  if (data.Sender == name.innerText) 
  position = "right";
  const div = document.createElement("div");
  const p = document.createElement("p")
  const small = document.createElement("small")
  const br = document.createElement('br');
  
  p.innerText = data.Massage;
  small.innerText = data.Time
  div.classList.add(position);
  div.appendChild(p);
  div.appendChild(br);
  div.appendChild(small);
  display.appendChild(div);
  scroll();
};

// for current typing

$("#msg").emojioneArea({
  pickerPostion : "right",
  events : {
    keyup : function() {
      // console.log(input.value)
      socket.emit("typing",{msg : name.innerText + " is typing...",reciver : reciver,sender : name.innerText})
  }
  }
})

    //socket bot
    
socket.on("botMsg",(data)=>{
  audio.play();
  appendrecive(data,"left")
})

// socket events 


socket.emit("UserName", name.innerText);

//debounce event 

let timerId = null;

function deBounce(func,timer){
    scroll();
    if(timerId){
        clearTimeout(timerId)
    }
    timerId = setTimeout(()=>{
        func();
    },timer)

}

let typeMsg = document.createElement("div");

socket.on("isType", (data) => {
    // console.log(data.sender,reciver)
    if(data.sender == reciver)
    {
        typeMsg.innerText = data.msg;
        typeMsg.classList.add("type")
        
        display.appendChild(typeMsg)
        deBounce(function(){
            display.removeChild(typeMsg)
        },1000)
    }
});


socket.on("Greeting", (data) => {
    appendrecive(data, "left");
});

socket.on("takeMsg", (data) => {
    for (var i = 0; i < data.length; i++) {
        appendMassages(data[i]);
    }
});

socket.on("Massage", (data) => {
  audio.play();
  if(data.name == reciver){
  appendrecive(data.msg, data.position);
}
else{
    alert(`${data.name} is sending u a massage !!!`)
  }
});

const scroll = () => {
    display.scrollTop = display.scrollHeight;
};
