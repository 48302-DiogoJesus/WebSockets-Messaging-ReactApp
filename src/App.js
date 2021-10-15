import './App.css';
import { io } from 'socket.io-client';
import React, { useState, useRef } from 'react';

const socket = io(`https://codeshare-backendservice.herokuapp.com/`);

function App() {

  const userName = useRef();
  const userMessage = useRef();
  const messagesFeed = useRef();

  const printCommands = () => {
    userMessage.current.placeholder = 
    '/commands => Get a list of all commands\n/clear => Clears all your messages feed\n'
  }

  // When server welcomes user
  socket.on('welcome', (message) => {
    messagesFeed.current.innerText = message;
    newLine();
  })

  // When server sends mesage update messages feed
  socket.on('message', async (msg) => {
    var color = 'green'
    if (msg.username === userName.current.value) {
      color = 'lightblue'
    }
    newLine()
    messagesFeed.current.innerHTML += `<pre><span style="font-style: bold; color: ${color}" class="username-identifier">${msg.username}</span>` + ' : ' + msg.message + '</pre>'
  })

  socket.on('userLeft', (message) => {
    newLine()
    messagesFeed.current.innerHTML += `<span style="font-weight:bolder; color:red">"${message.username}" has left.</span>`
    newLine()
  })

  socket.on('newUser', (message) => {
    newLine()
    messagesFeed.current.innerHTML += `<span style="font-weight:bolder; color:green">${message}</span>`
    newLine()
  })

  const newLine = () => {
    messagesFeed.current.innerHTML += '<br/>'
  }

  // Send a message to server
  const sendMessage = () => {
    if (userMessage.current.value.toString()[0] === '/') {
      handleCommand()
      return
    }
    if (userName.current.value !== ''){
      let message = userMessage.current.value
      if (message !== '' ) {
        socket.send({ username : userName.current.value, message })
        userMessage.current.value = '';
      }
    } else {
      alert("Please enter a username first")
    }
  }

  const handleKeyDown = () => {
    if (userMessage.current.value.toString()[0] === '/') {
      userMessage.current.style.color = 'green';
      userMessage.current.style.fontSize = '1.15rem';
    } else {
      userMessage.current.style.color = 'white';
      userMessage.current.style.fontSize = '1.1rem';
    }
  }

  const handleCommand = () => {
    let command = userMessage.current.value
    userMessage.current.value = ''
    switch (command) {
      case '/commands':
        printCommands()
        break;
      case '/clear':
        messagesFeed.current.innerHTML = '';
        break;
    }
  }

  return (
    <div className="App">
      <div className="input-group mb-3">
        <div className="user-wrapper">
          <input ref={userName} type="text" className="input username-input form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1"/>
        </div>
        
        <div ref={messagesFeed} className="messages-wrapper"></div>

        <div className="input-group">
          <textarea onChange={handleKeyDown} ref={userMessage} className="input form-control" aria-label="With textarea" spellCheck="false" placeholder="Type your message here.&#10;Use '/commands' to check the available commands !"></textarea>
        </div>
        <button onClick={sendMessage} type="button" className="send-message btn btn-dark">Send Message</button>
      </div>
    </div>
  );
}

export default App;
