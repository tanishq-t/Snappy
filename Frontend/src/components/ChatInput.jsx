import React, { useState, useRef, useEffect } from "react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoMdSend, IoMdAttach, IoMdMicrophone } from "react-icons/io";
import { FiPaperclip } from "react-icons/fi";
import styled from "styled-components";
import Picker from "emoji-picker-react";

export default function ChatInput({ handleSendMsg }) {
  const [msg, setMsg] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleEmojiPickerToggle = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const input = inputRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    
    const newMessage = msg.slice(0, start) + emoji + msg.slice(end);
    setMsg(newMessage);
    
    // Focus back to input and set cursor position
    setTimeout(() => {
      input.focus();
      input.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const sendChat = (event) => {
    event.preventDefault();
    if (msg.trim().length > 0) {
      handleSendMsg(msg.trim());
      setMsg("");
      setShowEmojiPicker(false);
    }
  };

  const handleInputChange = (e) => {
    setMsg(e.target.value);
    
    // Typing indicator logic
    if (!isTyping) {
      setIsTyping(true);
      // Emit typing start event here if needed
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      // Emit typing stop event here if needed
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat(e);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    // Voice recording logic would go here
  };

  const handleAttachment = () => {
    // File attachment logic would go here
    console.log("Attachment clicked");
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  return (
    <Container>
      <InputWrapper>
        <ActionsContainer>
          <ActionButton 
            className="emoji-container"
            onClick={handleEmojiPickerToggle}
            active={showEmojiPicker}
          >
            <BsEmojiSmileFill />
            {showEmojiPicker && (
              <EmojiPickerWrapper>
                <Picker 
                  onEmojiClick={handleEmojiClick}
                  theme="dark"
                  searchDisabled={false}
                  skinTonesDisabled={false}
                  width="100%"
                  height="400px"
                />
              </EmojiPickerWrapper>
            )}
          </ActionButton>
          
          <ActionButton onClick={handleAttachment}>
            <FiPaperclip />
          </ActionButton>
        </ActionsContainer>

        <InputForm onSubmit={sendChat}>
          <MessageInput
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            value={msg}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            autoComplete="off"
          />
          
          <RightActions>
            {msg.trim().length > 0 ? (
              <SendButton type="submit" disabled={msg.trim().length === 0}>
                <IoMdSend />
              </SendButton>
            ) : (
              <VoiceButton 
                type="button" 
                onClick={handleVoiceRecord}
                recording={isRecording}
              >
                <IoMdMicrophone />
              </VoiceButton>
            )}
          </RightActions>
        </InputForm>
      </InputWrapper>
      
      {isTyping && (
        <TypingIndicator>
          <span>Typing...</span>
        </TypingIndicator>
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 1rem 1.5rem;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  position: relative;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  svg {
    font-size: 1.2rem;
  }

  &:hover {
    background: rgba(99, 102, 241, 0.1);
    border-color: rgba(99, 102, 241, 0.3);
    color: #6366f1;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.active && `
    background: rgba(99, 102, 241, 0.2);
    border-color: rgba(99, 102, 241, 0.4);
    color: #6366f1;
  `}
`;

const EmojiPickerWrapper = styled.div`
  position: absolute;
  bottom: 60px;
  left: 0;
  z-index: 1000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.2s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .epr-dark-theme {
    background: #1a1a2e !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
  }

  .epr-search-container input {
    background: rgba(255, 255, 255, 0.05) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    color: #ffffff !important;
    
    &::placeholder {
      color: #94a3b8 !important;
    }
  }

  .epr-emoji-category-label {
    background: #1a1a2e !important;
    color: #94a3b8 !important;
  }

  .epr-emoji:hover {
    background: rgba(99, 102, 241, 0.1) !important;
  }
`;

const InputForm = styled.form`
  flex: 1;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 0.5rem 0.75rem;
  gap: 0.75rem;
  transition: all 0.2s ease;
  position: relative;

  &:focus-within {
    border-color: rgba(99, 102, 241, 0.3);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }
`;

const MessageInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 400;
  padding: 0.75rem 0;
  line-height: 1.5;

  &::placeholder {
    color: #64748b;
  }

  &::selection {
    background: rgba(99, 102, 241, 0.3);
  }
`;

const RightActions = styled.div`
  display: flex;
  align-items: center;
`;

const SendButton = styled.button`
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);

  svg {
    font-size: 1.1rem;
    transform: translateX(1px);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const VoiceButton = styled.button`
  background: ${props => props.recording 
    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
    : 'rgba(255, 255, 255, 0.05)'
  };
  border: 1px solid ${props => props.recording 
    ? 'rgba(239, 68, 68, 0.3)' 
    : 'rgba(255, 255, 255, 0.1)'
  };
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.recording ? '#ffffff' : '#94a3b8'};
  cursor: pointer;
  transition: all 0.2s ease;

  svg {
    font-size: 1.1rem;
  }

  &:hover {
    background: ${props => props.recording 
      ? 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' 
      : 'rgba(99, 102, 241, 0.1)'
    };
    border-color: ${props => props.recording 
      ? 'rgba(239, 68, 68, 0.4)' 
      : 'rgba(99, 102, 241, 0.3)'
    };
    color: ${props => props.recording ? '#ffffff' : '#6366f1'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  ${props => props.recording && `
    animation: pulse 1.5s infinite;
    
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }
  `}
`;

const TypingIndicator = styled.div`
  position: absolute;
  top: -30px;
  left: 1.5rem;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;