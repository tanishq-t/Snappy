import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIroutes";

export default function ChatContainer({ currentChat, socket }) {
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentChat) {
        const data = await JSON.parse(localStorage.getItem("chat-app-user"));
        const response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data.data);
      }
    };
    fetchMessages();
  }, [currentChat]);

  useEffect(() => {
    if (socket.current) {
      const handleMessageReceive = (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg.message, timestamp: new Date() });
      };

      const handleTyping = () => setIsTyping(true);
      const handleStopTyping = () => setIsTyping(false);

      socket.current.on("msg-recieve", handleMessageReceive);
      socket.current.on("typing", handleTyping);
      socket.current.on("stop-typing", handleStopTyping);

      return () => {
        socket.current.off("msg-recieve", handleMessageReceive);
        socket.current.off("typing", handleTyping);
        socket.current.off("stop-typing", handleStopTyping);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  const handleSendMsg = async (msg) => {
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));

    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: data._id,
      msg,
    });

    await axios.post(sendMessageRoute, {
      from: data._id,
      to: currentChat._id,
      message: msg,
    });

    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg, timestamp: new Date() });
    setMessages(msgs);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Container>
      <ChatHeader>
        <UserInfo>
          <AvatarContainer>
            <Avatar
              src={`data:image/svg+xml;base64,${currentChat.AvatarImage}`}
              alt="avatar"
            />
            <StatusIndicator className={isOnline ? 'online' : 'offline'} />
          </AvatarContainer>
          <UserDetails>
            <Username>{currentChat.username}</Username>
            <Status>
              {isTyping ? 'typing...' : isOnline ? 'online' : 'last seen recently'}
            </Status>
          </UserDetails>
        </UserInfo>
        <HeaderActions>
          <ActionButton>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </ActionButton>
          <ActionButton>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </ActionButton>
          <Logout />
        </HeaderActions>
      </ChatHeader>

      <MessagesContainer>
        <MessagesList>
          {messages.map((message, index) => (
            <MessageWrapper key={uuidv4()} className={message.fromSelf ? "sent" : "received"}>
              <MessageBubble className={message.fromSelf ? "sent" : "received"}>
                <MessageContent>{message.message}</MessageContent>
                <MessageTime>{formatTime(message.timestamp)}</MessageTime>
              </MessageBubble>
            </MessageWrapper>
          ))}
          {isTyping && (
            <MessageWrapper className="received">
              <TypingIndicator>
                <TypingDot />
                <TypingDot />
                <TypingDot />
              </TypingIndicator>
            </MessageWrapper>
          )}
          <div ref={scrollRef} />
        </MessagesList>
      </MessagesContainer>

      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  position: relative;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AvatarContainer = styled.div`
  position: relative;
`;

const Avatar = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid rgba(99, 102, 241, 0.3);
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(99, 102, 241, 0.6);
    transform: scale(1.05);
  }
`;

const StatusIndicator = styled.div`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #16213e;
  
  &.online {
    background: #10b981;
    animation: pulse 2s infinite;
  }
  
  &.offline {
    background: #6b7280;
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
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const Username = styled.h3`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
`;

const Status = styled.span`
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 400;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    color: #6366f1;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
`;

const MessagesList = styled.div`
  height: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, #4f46e5, #7c3aed);
    border-radius: 3px;
    transition: all 0.3s ease;

    &:hover {
      background: linear-gradient(180deg, #6366f1, #8b5cf6);
    }
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  margin-bottom: 0.5rem;
  animation: slideIn 0.3s ease-out;

  &.sent {
    justify-content: flex-end;
  }

  &.received {
    justify-content: flex-start;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &.sent {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    border-bottom-right-radius: 6px;
    margin-left: auto;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
    }
  }

  &.received {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    border-bottom-left-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      background: rgba(255, 255, 255, 0.12);
    }
  }

  @media screen and (max-width: 768px) {
    max-width: 85%;
  }
`;

const MessageContent = styled.p`
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.4;
  word-break: break-word;
`;

const MessageTime = styled.span`
  font-size: 0.7rem;
  opacity: 0.7;
  margin-top: 0.25rem;
  display: block;
  text-align: right;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  border-bottom-left-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TypingDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typing 1.4s infinite ease-in-out;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.2s;
  }

  &:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-10px);
      opacity: 1;
    }
  }
`;