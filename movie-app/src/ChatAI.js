import React from "react";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Movie from "./Movie";
import { Link } from "react-router-dom";

import "./chat.css";

import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
   MainContainer,
   ChatContainer,
   MessageList,
   Message,
   MessageInput,
   TypingIndicator,
} from "@chatscope/chat-ui-kit-react";

const systemMessage = {
   role: "system",
   content:
      "Discuss and recommend movies and series like you're talking to a movie enthusiast. You are strictly forbidden to talk about anything other than movies or series. If the user asks something else, firmly inform them that you can only discuss movies and series.",
};

const ChatAI = () => {
   const navigate = useNavigate();

   const [messages, setMessages] = useState([
      {
         message:
            "Hello, I'm a movie expert! Ask me anything about movies or series!",
         sentTime: "just now",
         sender: "Movie Expert",
         movie_details: null,
      },
   ]);
   const [isTyping, setIsTyping] = useState(false);

   const handleSend = async (message) => {
      const newMessage = {
         message,
         direction: "outgoing",
         sender: "user",
      };

      const newMessages = [...messages, newMessage];

      setMessages(newMessages);
      setIsTyping(true);
      await processMessageToChatGPT(newMessages);
   };

   async function processMessageToChatGPT(chatMessages) {
      let apiMessages = chatMessages.map((messageObject) => {
         let role = "";
         if (messageObject.sender === "ChatGPT") {
            role = "assistant";
         } else {
            role = "user";
         }
         return { role: role, content: messageObject.message };
      });

      const apiRequestBody = {
         messages: [systemMessage, ...apiMessages],
      };

      await fetch("http://localhost:8000/api/chat_gpt/", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(apiRequestBody),
      })
         .then((data) => {
            return data.json();
         })
         .then((data) => {
            console.log(data);
            setMessages([
               ...chatMessages,
               {
                  message: data.message,
                  sender: "ChatGPT",
                  movie_details: data.movie_details || [],
               },
            ]);
            setIsTyping(false);
         });
   }

   return (
      <div className="app" style={{ width: "100%" }}>
         <h1>The Movie App</h1>
         <div className="buttons">
            <Button
               className="button"
               variant="contained"
               onClick={() => navigate("/")}
            >
               Search by Title
            </Button>
            <Button
               className="button"
               variant="contained"
               onClick={() => navigate("/textsearch")}
            >
               Search by Text.
            </Button>
         </div>
         <div className="chatWindow">
            <MainContainer className="mainContainer">
               <ChatContainer className="chatContainer">
                  <MessageList
                     className="messageList"
                     scrollBehavior="smooth"
                     typingIndicator={
                        isTyping ? (
                           <TypingIndicator content="MovieExpert is typing" />
                        ) : null
                     }
                  >
                     {messages.map((message, i) => {
                        return (
                           <React.Fragment key={i}>
                              <Message model={message} />

                              {message.movie_details &&
                                 message.movie_details.length && (
                                    <div className="container">
                                       {message.movie_details.map(
                                          (movie, index) => (
                                             <Link
                                                key={index}
                                                to={{
                                                   pathname: `/movie/${movie.id}`,
                                                   state: { movie: movie },
                                                }}
                                             >
                                                <Movie movie={movie} />
                                             </Link>
                                          )
                                       )}
                                    </div>
                                 )}
                           </React.Fragment>
                        );
                     })}
                  </MessageList>

                  <MessageInput
                     className="messageInput"
                     placeholder="Type message here"
                     onSend={handleSend}
                     attachButton={false}
                  />
               </ChatContainer>
            </MainContainer>
         </div>
      </div>
   );
};

export default ChatAI;
