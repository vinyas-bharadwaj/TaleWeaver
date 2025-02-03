import React, { useContext } from "react";
import { Link } from "react-router-dom";
import styles from '../styles/Signup.module.scss';
import AuthContext from "../context/AuthContext";

const Signup = () => {
  let { signupUser } = useContext(AuthContext);

  return (
    <div className={styles['signup-container']}>
      <h1 className={styles['signup-title']}>Sign Up</h1>
      <form className={styles['signup-form']} onSubmit={signupUser}>
        <div className={styles['input-group']}>
          <label htmlFor="username">Username</label>
          <input 
            name='username'
            type="username" 
            placeholder="Enter your username" 
            required 
          />
        </div>
        <div className={styles['input-group']}>
          <label htmlFor="email">Email</label>
          <input 
            name='email'
            type="email" 
            placeholder="Enter your email id" 
            required 
          />
        </div>
        <div className={styles['input-group']}>
          <label htmlFor="password">Password</label>
          <input 
            name='password'
            type="password" 
            placeholder="Enter your password" 
            required 
          />
        </div>
        <div className={styles['input-group']}>
          <label htmlFor="confirm-password">Confirm Password</label>
          <input 
            name='confirmPassword'
            type="password" 
            placeholder="Confirm your password" 
            required 
          />
        </div>
        <div className={styles['login-link']}>
            <p>Already have an account? <Link to="/login">Login</Link></p> 
        </div>
        <center><button type="submit" className={styles['signup-button']}>Sign Up</button></center>
      </form>
    </div>
  );
};

export default Signup;
