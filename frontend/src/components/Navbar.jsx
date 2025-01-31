import { useContext } from "react";
import "../styles/Navbar.css";
import TaleWeaverFavicon from "../assets/TaleWeaver-favicon.svg";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext); 

  return (
    <nav className="navbar">
      <div className="starry-background" />
      <div className="container">
        <Link to="/" className="logo">
          <img 
            src={TaleWeaverFavicon} 
            alt="TaleWeaver Logo" 
            width={40} 
            height={30} 
          />
          TaleWeaver
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>

          {/* Conditionally render Login or Logout */}
          {!user ? (
            <Link to="/login" className="nav-link">
              Login
            </Link>
          ) : (
            <button onClick={logoutUser} className="nav-link">
              Logout
            </button>
          )}
          
          <Link to="/signup" className="nav-link">
            Sign Up
          </Link>
          <Link to="/profile" className="profile-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="profile-icon"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
