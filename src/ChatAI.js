import React from 'react'
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { useState } from 'react'

import './chat.css'

import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';


const API_KEY = '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'
const systemMessage = { 
    "role": "system", "content": "Discuss and recommend movies and series like you're talking to a movie enthusiast. You are strictly forbidden to talk about anything other than movies or series. If the user asks something else, firmly inform them that you can only discuss movies and series."
  }

const ChatAI = () => {

    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
          message: "Hello, I'm a movie expert! Ask me anything about movies or series!",
          sentTime: "just now",
          sender: "Movie Expert",
        }
      ]);
      const [isTyping, setIsTyping] = useState(false);

      const handleSend = async (message) => {
        const newMessage = {
          message,
          direction: 'outgoing',
          sender: "user"
        };

        const newMessages = [...messages, newMessage];

        setMessages(newMessages);

        // Initial system message to determine ChatGPT functionality
        // How it responds, how it talks, etc.
        setIsTyping(true);
        await processMessageToChatGPT(newMessages);
      };

      async function processMessageToChatGPT(chatMessages) { // messages is an array of messages
        // Format messages for chatGPT API
        // API is expecting objects in format of { role: "user" or "assistant", "content": "message here"}
        // So we need to reformat

        let apiMessages = chatMessages.map((messageObject) => {
          let role = "";
          if (messageObject.sender === "ChatGPT") {
            role = "assistant";
          } else {
            role = "user";
          }
          return { role: role, content: messageObject.message}
        });
    
    
        // Get the request body set up with the model we plan to use
        // and the messages which we formatted above. We add a system message in the front to'
        // determine how we want chatGPT to act. 
        const apiRequestBody = {
            "model": "gpt-3.5-turbo",
            "messages": [
                systemMessage,  // The system message DEFINES the logic of our chatGPT
                ...apiMessages // The messages from our chat with ChatGPT
            ],
            "max_tokens": 100,
        }
    
        await fetch("https://api.openai.com/v1/chat/completions", 
        {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(apiRequestBody)
        }).then((data) => {
          return data.json();
        }).then((data) => {
          console.log(data);
          setMessages([...chatMessages, {
            message: data.choices[0].message.content,
            sender: "ChatGPT"
          }]);
          setIsTyping(false);
        });
      }
      



  return (
    <div className="app" style={{width: '100%'}}>
          <h1>The Movie App</h1>
          <div className="buttons">
            <Button
                className="button"
                variant="contained"
                onClick={() => navigate('/')}
            >
                Search by Title
            </Button>
            <Button
                className="button"
                variant="contained"
                onClick={() => navigate('/textsearch')}
                >
                    Search by Text
            </Button>
          </div>
            <div className='chatWindow'>
                <MainContainer className='mainContainer'>
                    <ChatContainer className='chatContainer'>
                        <MessageList
                            className='messageList'
                            scrollBehavior="smooth" 
                            typingIndicator={isTyping ? <TypingIndicator content="MovieExpert is typing" /> : null}
                        >
                        {messages.map((message, i) => {
                            console.log(message)
                            return <Message key={i} model={message} />
                        })}
                        </MessageList>
                        <MessageInput
                            className='messageInput'
                            placeholder="Type message here"
                            onSend={handleSend}
                            attachButton={false}
                        />
                    </ChatContainer>
                </MainContainer>
            </div>


    </div>

  )
}

export default ChatAI