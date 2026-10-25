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
  const [loading, setLoading] = useState(false);


  const handleLogin = async (e) => {

    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {

      const response =
        await axios.post(
          "/api/auth/login",
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
        "Unable to connect to StudyGenie. Please try again."
      );

    } finally {
      setLoading(false);
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


          <label htmlFor="login-email">
            Email Address
          </label>

          <input
            id="login-email"
            type="email"
            placeholder="Enter your email"
            autoComplete="email"
            value={email}
            onChange={
              (e) =>
                setEmail(e.target.value)
            }
            required
          />


          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter password"
            autoComplete="current-password"
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
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>


          {message && (
            <p className="message" role="alert">
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