import React, { useState, useContext } from "react";
import { Link } from "react-router-dom"; 
import styles from '../styles/Login.module.scss'; 
import AuthContext from "../context/AuthContext";

const Login = () => {
  let { loginUser } = useContext(AuthContext);

  return (
    <div className={styles['login-container']}>
      <h1 className={styles['login-title']}>Login</h1>
      <form className={styles['login-form']} onSubmit={loginUser}>
        <div className={styles['input-group']}>
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            name="username"
            placeholder="Enter your email" 
            required 
          />
        </div>
        <div className={styles['input-group']}>
          <label htmlFor="password">Password</label>
          <input 
            type="password" 
            name="password"
            placeholder="Enter your password" 
            required 
          />
        </div>

        <div className={styles['signup-link']}>
            <p>Already have an account? <Link to="/signup">Sign Up</Link></p> 
        </div>
        <center><button type="submit" className={styles['login-button']}>Login</button></center>
      </form>
    </div>
  );
};

export default Login;
