import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");


  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const response =
        await axios.post(
          "http://localhost:5000/api/auth/login",
          {
            email,
            password
          }
        );


      localStorage.setItem(
        "token",
        response.data.token
      );


      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );


      navigate("/dashboard");


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Login Failed"
      );

    }

  };


  return (

    <div className="authPage">

      <div className="authLeft">

        <span className="badge">
          👋 Welcome Back
        </span>

        <h1>
          Login to Your
          <span> StudyGenie </span>
          Account
        </h1>

        <p>
          Access your personalized dashboard,
          study materials, AI notes,
          quizzes and much more.
        </p>

        <img
          src="/robot.png"
          alt="StudyGenie AI"
          className="authRobot"
        />

      </div>


      <div className="authRight">

        <form
          className="authCard"
          onSubmit={handleLogin}
        >

          <h1>
            Welcome Back!
          </h1>

          <p>
            Login to continue your learning journey
          </p>


          <label>
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={
              (e) =>
                setEmail(e.target.value)
            }
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={
              (e) =>
                setPassword(e.target.value)
            }
            required
          />


          <button
            type="submit"
            className="authButton"
          >
            Login
          </button>


          {message && (
            <p className="message">
              {message}
            </p>
          )}


          <p className="switchAuth">

            Don't have an account?

            <Link to="/register">
              Register
            </Link>

          </p>

        </form>

      </div>

    </div>

  );
}

export default Login;