import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { Buffer } from "buffer";
import loader from "../assets/loader.gif";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { setAvatarRoute } from "../utils/APIroutes";
import multiavatar from "@multiavatar/multiavatar/esm";

export default function SetAvatar() {
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(undefined);
  const [isSetting, setIsSetting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const toastOptions = {
    position: "bottom-right",
    autoClose: 5000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  const getBase64 = (svgCode) => {
    try {
      const buffer = Buffer.from(svgCode);
      return buffer.toString("base64");
    } catch {
      return window.btoa(unescape(encodeURIComponent(svgCode)));
    }
  };

  const generateAvatars = () => {
    const newAvatars = [];
    for (let i = 0; i < 4; i++) {
      try {
        const seed = `${Math.random().toString(36).substring(2, 10)}-${Date.now()}-${i}`;
        const svgCode = multiavatar(seed);
        const base64 = getBase64(svgCode);
        newAvatars.push(base64);
      } catch (error) {
        console.error("Avatar generation error:", error);
      }
    }
    setAvatars(newAvatars);
    setIsLoading(false);
  };

  useEffect(() => {
    const user = localStorage.getItem("chat-app-user");
    if (!user) {
      navigate("/login");
    } else {
      generateAvatars();
    }
  }, [navigate]);

  const setProfilePicture = async () => {
    if (selectedAvatar === undefined) {
      toast.error("Please select an avatar", toastOptions);
      return;
    }

    setIsSetting(true);
    try {
      const userStr = localStorage.getItem("chat-app-user");
      const user = JSON.parse(userStr);
      const avatar = avatars[selectedAvatar];

      const { data } = await axios.post(`${setAvatarRoute}/${user._id}`, {
        image: avatar,
      });
      console.log(data)

      if (data.statusCode === 200) {
        user.isAvatarImageSet = true;
        user.AvatarImage = data.data.AvatarImage;
        localStorage.setItem("chat-app-user", JSON.stringify(user));
        toast.success("Avatar set successfully!", toastOptions);
        setTimeout(() => navigate("/"), 1000);
      } else {
        toast.error("Failed to set avatar", toastOptions);
      }
    } catch (err) {
      console.error("Avatar setting failed:", err);
      toast.error("Something went wrong. Try again.", toastOptions);
    } finally {
      setIsSetting(false);
    }
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    setSelectedAvatar(undefined);
    setTimeout(() => {
      generateAvatars();
      setIsRegenerating(false);
      toast.info("New avatars generated!", toastOptions);
    }, 800);
  };

  return (
    <>
      <Container>
        <ContentWrapper>
          {isLoading ? (
            <LoadingSection>
              <LoaderContainer>
                <CustomLoader />
              </LoaderContainer>
              <LoadingText>Generating your avatars...</LoadingText>
            </LoadingSection>
          ) : (
            <>
              <HeaderSection>
                <Title>Choose Your Avatar</Title>
                <Subtitle>Pick a profile picture that represents you</Subtitle>
              </HeaderSection>

              <AvatarGrid>
                {avatars.map((avatar, index) => (
                  <AvatarCard
                    key={index}
                    className={selectedAvatar === index ? "selected" : ""}
                    onClick={() => setSelectedAvatar(index)}
                    isSelected={selectedAvatar === index}
                  >
                    <AvatarImage
                      src={`data:image/svg+xml;base64,${avatar}`}
                      alt={`Avatar ${index + 1}`}
                    />
                    <SelectionOverlay className="selection-overlay">
                      <CheckIcon>✓</CheckIcon>
                    </SelectionOverlay>
                  </AvatarCard>
                ))}
              </AvatarGrid>

              <ButtonSection>
                <PrimaryButton
                  onClick={setProfilePicture}
                  disabled={selectedAvatar === undefined || isSetting}
                >
                  {isSetting ? (
                    <>
                      <Spinner />
                      Setting Avatar...
                    </>
                  ) : (
                    'Set as Profile Picture'
                  )}
                </PrimaryButton>

                <SecondaryButton
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <>
                      <Spinner />
                      Generating...
                    </>
                  ) : (
                    '🎲 Generate New Avatars'
                  )}
                </SecondaryButton>
              </ButtonSection>
            </>
          )}
        </ContentWrapper>
        
        <BackgroundDecoration />
      </Container>
      <ToastContainer />
    </>
  );
}

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ContentWrapper = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem 0;
`;

const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 8rem;
`;

const CustomLoader = styled.div`
  width: 4rem;
  height: 4rem;
  border: 4px solid rgba(102, 126, 234, 0.2);
  border-left: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
`;

const HeaderSection = styled.div`
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 0;
  font-weight: 500;
`;

const AvatarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  padding: 0 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
`;

const AvatarCard = styled.div`
  position: relative;
  background: white;
  border-radius: 20px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 3px solid ${props => props.isSelected ? '#667eea' : 'transparent'};
  box-shadow: ${props => props.isSelected 
    ? '0 10px 25px rgba(102, 126, 234, 0.3)' 
    : '0 4px 12px rgba(0, 0, 0, 0.1)'};
  transform: ${props => props.isSelected ? 'scale(1.05)' : 'scale(1)'};

  &:hover {
    transform: ${props => props.isSelected ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }

  .selection-overlay {
    opacity: ${props => props.isSelected ? '1' : '0'};
  }
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: contain;
  border-radius: 12px;

  @media (max-width: 768px) {
    height: 80px;
  }
`;

const SelectionOverlay = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #667eea;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
`;

const CheckIcon = styled.span`
  font-size: 1rem;
  line-height: 1;
`;

const ButtonSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const SecondaryButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #667eea;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const Spinner = styled.div`
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const BackgroundDecoration = styled.div`
  position: fixed;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.03));
  pointer-events: none;
  animation: float 20s ease-in-out infinite;

  @keyframes float {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(180deg); }
  }
`;