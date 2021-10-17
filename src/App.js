import './App.css';
import { io } from 'socket.io-client';
import React, { useRef } from 'react';

// Link to the Socket Server
const socket = io(`https://codeshare-backendservice.herokuapp.com/`);

/**
 * For Local development purposes only
 */
// const socket = io(`http://localhost:3000/`);

function App() {

  /**
   * References to easily extract UI values:
   * userName -> username input field
   * userMessage -> user message input field
   * messagesFeed -> messages feed from screen
   */
  const userName = useRef();
  const userMessage = useRef();
  const messagesFeed = useRef();

  // Print all the available commands as a placeholder inside the userMessage field
  const printCommands = () => {
    userMessage.current.placeholder = 
    '/commands => Get a list of all commands\n/clear => Clears all your messages feed\n'
  }

  // When user gets greeted by server upon connecting
  socket.on('welcome', (message) => {
    messagesFeed.current.innerText = message;
    newLine();
  })

  // When server sends a new message to clients
  socket.on('message', async (message) => {
    // Messages global wrapper
    const msgFeed = document.getElementsByClassName('messages-wrapper')[0]

    // Choose the color of the username (green -> other users; lightblue -> this user)
    var color = 'green'
    if (message.username === userName.current.value) {
      color = 'lightblue'
    }

    // Stores the new message that will later be appended to the contents inside the messages feed
    var newMsgContent = ''
    var pre = document.createElement('pre')
    // Message Container
    var newMessage = document.createElement('div')
    // Username custom box
    let userLabel = document.createElement('span')
    // Customizing username identifying box
    userLabel.style.fontWeight = 'bolder'
    userLabel.style.color = color
    userLabel.innerText = message.username + ' : '

    newMessage.appendChild(userLabel)

    // Go through each word in the message and decide how it shoul be displayed to the user
    for (let word of message.message.split(' ')) {
      // In case message contains a URL
      if (word.includes('http') || word.includes('www.')) {
        newMsgContent +=  `<a href="${word}" target="_blank" class="url">${word}</a> `
      } else {
        newMsgContent += word + ' '
      } 
    }

    newMessage.className = 'message-wrapper'
    newMessage.innerHTML += newMsgContent.trim()

    newLine()
    pre.appendChild(newMessage)
    msgFeed.appendChild(pre)   
    // Scroll bottom since there is a new message
    msgFeed.scrollTop = msgFeed.scrollHeight
  })

  // OTHER USER LEAVES
  socket.on('userLeft', (message) => {
    newLine()
    messagesFeed.current.innerHTML += `<span style="font-weight:bolder; color:red">"${message.username}" has left</span>`
    newLine()
  })

  // OTHER USER JOINS
  socket.on('newUser', (message) => {
    newLine()
    messagesFeed.current.innerHTML += `<span style="font-weight:bolder; color:green">${message}</span>`
    newLine();
  })

  // SERVER TELLS CLIENT TO UPDATE THE USERS NUMBER
  socket.on('usersNumber', n_users => {
    document.getElementById('users-number').innerText = n_users.toString()
  })

  // ADDS A NEW LINE TO THE MESSAGES FEED
  const newLine = () => {
    messagesFeed.current.innerHTML += '<br/>'
  }

  // HANDLES THE INPUT INSIDE THE USER MESSAGE INPUT FIELD
  const handleMessage = () => {
    // In case it's a command
    if (userMessage.current.value.toString()[0] === '/') {
      handleCommand()
      return
    }

    // In case it's a normal message to be broadcasted
    if (userName.current.value !== ''){
      let message = userMessage.current.value
      if (message !== '' ) {
        socket.send({ username : userName.current.value, message })
        // Clear the user message input field
        userMessage.current.value = '';
      }
    } else {
      // Users without username can't send messages
      alert("Please enter a username first")
    }
  }

  // Detect when user is going to execute a command and make the text green
  // Also detect when it's not a command to make text white again
  const handleKeyDown = () => {
    if (userMessage.current.value.toString()[0] === '/') {
      userMessage.current.style.color = 'green';
      userMessage.current.style.fontSize = '1.15rem';
    } else {
      userMessage.current.style.color = 'white';
      userMessage.current.style.fontSize = '1.1rem';
    }
  }

  // Handles all the commands
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
        
        <div className="users-number" style={{color:'white'}}>
          Online Users : <span id="users-number">0</span> 
        </div>

        <div ref={messagesFeed} className="messages-wrapper"></div>

        <div className="input-group">
          <textarea onChange={handleKeyDown} ref={userMessage} className="input form-control" aria-label="With textarea" spellCheck="false" placeholder="Type your message here.&#10;Use '/commands' to check the available commands !"></textarea>
        </div>
        <div className="buttons-wrapper">
          <button onClick={handleMessage} type="button" className="send-message btn btn-dark">Send Message</button>
        </div>
      </div>
    </div>
  );
}

export default App;
