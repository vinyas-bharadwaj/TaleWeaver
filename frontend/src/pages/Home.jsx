import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from '../styles/Home.module.scss';

const Home = () => {
  const navigate = useNavigate()
  const {user} = useContext(AuthContext);

  return (
    <div className={styles["home-container"]}>
      <h1 className={styles['home-title']}>Hello {user? user.username: 'User'}</h1>
      <h1 className={styles['home-title']}>Welcome to TaleWeaver</h1>
      <button onClick={() => navigate('/story')} className={styles['create-button']}>Create</button>
    </div>
  );
};

export default Home;