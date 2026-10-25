import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();
    setMessage("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setMessage(
        "Passwords do not match"
      );
      setMessageType("error");

      return;
    }

    if (formData.password.length < 8) {
      setMessage("Password must be at least 8 characters");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          "/api/auth/register",
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          }
        );

      setMessage(
        response.data.message || "Registration successful"
      );
      setMessageType("success");
      window.setTimeout(() => navigate("/login"), 900);


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Unable to connect to StudyGenie. Please try again."
      );
      setMessageType("error");

    } finally {
      setLoading(false);
    }

  };


  return (

    <div className="authPage">

      <div className="authLeft">

        <div>

          <span className="badge">
            ✨ Create Your Account
          </span>

          <h1>
            Join StudyGenie
            and Start Your
            <span> Smart Learning Journey</span>
          </h1>

          <p>
            Create your account and unlock
            powerful AI tools to study smarter,
            not harder.
          </p>

          <img
            src="/robot.png"
            alt="StudyGenie"
            className="authRobot"
          />

        </div>

      </div>


      <div className="authRight">

        <form
          className="authCard"
          onSubmit={handleSubmit}
        >

          <h1>
            Create Your Account
          </h1>

          <p>
            Fill in the details to get started
          </p>


          <label htmlFor="register-name">
            Full Name
          </label>

          <input
            id="register-name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            autoComplete="name"
            minLength="2"
            maxLength="80"
            value={formData.name}
            onChange={handleChange}
            required
          />


          <label htmlFor="register-email">
            Email Address
          </label>

          <input
            id="register-email"
            type="email"
            name="email"
            placeholder="Enter your email address"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />


          <label htmlFor="register-password">
            Password
          </label>

          <input
            id="register-password"
            type="password"
            name="password"
            placeholder="Create password"
            autoComplete="new-password"
            minLength="8"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <label htmlFor="register-confirm-password">
            Confirm Password
          </label>

          <input
            id="register-confirm-password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength="8"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />


          <button
            className="authButton"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Register Now"}
          </button>


          {message && (
            <p className={`message ${messageType}`} role={messageType === "error" ? "alert" : "status"}>
              {message}
            </p>
          )}


          <p className="switchAuth">

            Already have an account?

            <Link to="/login">
              Login
            </Link>

          </p>

        </form>

      </div>

    </div>

  );
}

export default Register;