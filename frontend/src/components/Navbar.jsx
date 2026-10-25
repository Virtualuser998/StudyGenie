import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        🎓 Study<span>Genie</span>
      </Link>

      <div className="navLinks">
        <Link to="/">Home</Link>
        <a href="#features">
          Features
        </a>

        <a href="#how">
          How It Works
        </a>

        <a href="#about">
          About
        </a>

        <Link to="/login" className="loginBtn">
          Login
        </Link>

        <Link to="/register" className="primaryBtn">
          Get Started
        </Link>

      </div>

    </nav>
  );
}

export default Navbar;