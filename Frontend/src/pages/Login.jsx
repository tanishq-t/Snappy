import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../assets/logo.svg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginRoute } from "../utils/APIroutes";

function Login() {
  const navigate = useNavigate()

  const toastOptions = {
    position: "bottom-right",
    autoClose: 8000,
    pauseOnHover: true,
    draggable: true,
    theme: "dark",
  };

  useEffect(() => {
    if (localStorage.getItem("chat-app-user")) {
      navigate("/");
    }
  }, []);

  const [values, setValues] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleValidation = () => {
    const { password, username } = values;
    if(username === ""){
      toast.error(
        "Username is required!",
        toastOptions
      );
      return false;
    }
    else if (password === "") {
      toast.error(
        "Password is required!",
        toastOptions
      );
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (handleValidation()) {
      setIsLoading(true);
      try {
        const { username, password } = values;
        const { data } = await axios.post(loginRoute, {
          username,
          password,
        });

        console.log(data);

        if(data.statusCode === 200){
          console.log("User Logged In Successfully!!")
          localStorage.setItem("chat-app-user",JSON.stringify(data.data.user));
        }      
        navigate("/")        
      } 
      catch (error) {
        toast.error("Username or Password is Incorrect!!", toastOptions);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <FormContainer>
        <FormWrapper>
          <BrandSection>
            <LogoContainer>
              <img src={Logo} alt="logo" />
            </LogoContainer>
            <BrandTitle>snappy</BrandTitle>
            <Subtitle>Welcome back! Please sign in to your account</Subtitle>
          </BrandSection>

          <LoginForm onSubmit={(event) => handleSubmit(event)}>
            <InputGroup>
              <InputField
                type="text"
                placeholder="Username"
                name="username"
                value={values.username}
                onChange={(e) => handleChange(e)}
                required
              />
              <InputLabel>Username</InputLabel>
            </InputGroup>

            <InputGroup>
              <InputField
                type="password"
                placeholder="Password"
                name="password"
                value={values.password}
                onChange={(e) => handleChange(e)}
                required
              />
              <InputLabel>Password</InputLabel>
            </InputGroup>

            <SubmitButton type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </SubmitButton>

            <Divider />

            <RegisterPrompt>
              Don't have an account? <RegisterLink to="/register">Create one</RegisterLink>
            </RegisterPrompt>
          </LoginForm>
        </FormWrapper>
        
        <BackgroundDecoration />
      </FormContainer>
      <ToastContainer />
    </>
  )
}

const FormContainer = styled.div`
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

const FormWrapper = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;

  @media (max-width: 480px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const BrandSection = styled.div`
  text-align: center;
  margin-bottom: 2.5rem;
`;

const LogoContainer = styled.div`
  display: inline-block;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  margin-bottom: 1rem;
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);

  img {
    height: 3rem;
    width: auto;
    filter: brightness(0) invert(1);
  }
`;

const BrandTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0.5rem 0;
  text-transform: lowercase;
  letter-spacing: -0.02em;
`;

const Subtitle = styled.p`
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;

  &::placeholder {
    color: transparent;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    transform: translateY(-2px);
  }

  &:focus + label,
  &:not(:placeholder-shown) + label {
    transform: translateY(-2.5rem) scale(0.85);
    color: #667eea;
    font-weight: 600;
  }
`;

const InputLabel = styled.label`
  position: absolute;
  left: 1.25rem;
  top: 1rem;
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 500;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left top;
`;

const SubmitButton = styled.button`
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
  text-transform: none;
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

const Divider = styled.div`
  height: 1px;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
  margin: 0.5rem 0;
`;

const RegisterPrompt = styled.div`
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
`;

const RegisterLink = styled(Link)`
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    color: #764ba2;
    text-decoration: underline;
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

export default Login;