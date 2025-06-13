import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIroutes";
import ChatContainer from "../components/ChatContainer";
import Contacts from "../components/Contacts";
import Welcome from "../components/Welcome";

export default function Chat() {
  const socket = useRef();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const updateUser = async () => {
      if (!localStorage.getItem("chat-app-user")) {
        navigate("/login");
      } else {
        setCurrentUser(
          await JSON.parse(localStorage.getItem("chat-app-user"))
        );
      }
    };
    updateUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);

  useEffect(() => {
    const updateContacts = async () => {
      if (currentUser) {
        const data = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        setContacts(data.data.data);
      }
    };
    updateContacts();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} />
        {currentChat === undefined ? (
          <Welcome />
        ) : (
          <ChatContainer currentChat={currentChat} socket={socket} />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 50%, #1a1a2e 100%);
  padding: 1rem;
  box-sizing: border-box;

  .container {
    height: 95vh;
    width: 95vw;
    max-width: 1600px;
    background: #16213e;
    border-radius: 16px;
    display: grid;
    grid-template-columns: 320px 1fr;
    overflow: hidden;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        135deg,
        rgba(99, 102, 241, 0.03) 0%,
        rgba(168, 85, 247, 0.03) 50%,
        rgba(236, 72, 153, 0.03) 100%
      );
      pointer-events: none;
      z-index: 0;
    }

    /* Responsive Design */
    @media screen and (max-width: 1024px) {
      width: 98vw;
      height: 98vh;
      grid-template-columns: 280px 1fr;
    }

    @media screen and (max-width: 768px) {
      width: 100vw;
      height: 100vh;
      border-radius: 0;
      grid-template-columns: 1fr;
    }

    @media screen and (min-width: 1400px) {
      grid-template-columns: 360px 1fr;
    }
  }

  /* Enhanced scrollbar styling */
  * {
    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #4f46e5, #7c3aed);
      border-radius: 4px;
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(180deg, #6366f1, #8b5cf6);
      }
    }
  }

  /* Smooth transitions for all interactive elements */
  * {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Focus styles for accessibility */
  *:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  /* Selection styling */
  *::selection {
    background-color: rgba(99, 102, 241, 0.3);
    color: #ffffff;
  }

  /* Improved text rendering */
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* Loading state styles */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #94a3b8;
    font-size: 16px;
  }

  /* Error state styles */
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #ef4444;
    font-size: 16px;
    text-align: center;
    padding: 2rem;
  }

  /* Animation for container entrance */
  .container {
    animation: slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Subtle glow effect on hover */
  .container:hover {
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.6),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 40px rgba(99, 102, 241, 0.1);
  }

  /* Status indicator styles */
  .status-online {
    width: 12px;
    height: 12px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid #16213e;
    animation: pulse 2s infinite;
  }

  .status-offline {
    width: 12px;
    height: 12px;
    background: #6b7280;
    border-radius: 50%;
    border: 2px solid #16213e;
  }

  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
    }
    70% {
      box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
    }
    100% {
      box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
    }
  }

  /* Toast notification styles */
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #16213e;
    color: #ffffff;
    padding: 12px 20px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* Mobile-specific styles */
  @media screen and (max-width: 768px) {
    padding: 0;
    
    .container {
      border-radius: 0;
      box-shadow: none;
      border: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .container {
      border: 2px solid #ffffff;
      background: #000000;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;