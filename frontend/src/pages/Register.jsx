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


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setMessage(
        "Passwords do not match"
      );

      return;
    }


    try {

      const response =
        await axios.post(
          "http://localhost:5000/api/auth/register",
          {
            name: formData.name,
            email: formData.email,
            password: formData.password
          }
        );

      setMessage(
        response.data.message
      );

      setTimeout(() => {

        navigate("/login");

      }, 1000);


    } catch (error) {

      setMessage(
        error.response?.data?.message ||
        "Registration Failed"
      );

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


          <label>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />


          <label>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
          />


          <label>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Create password"
            value={formData.password}
            onChange={handleChange}
            required
          />


          <label>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />


          <button
            className="authButton"
            type="submit"
          >
            Register Now
          </button>


          {message && (
            <p className="message">
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