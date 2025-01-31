import React, {useContext} from 'react'
import AuthContext from '../context/AuthContext';

const Home = () => {
  const {user} = useContext(AuthContext);
  return (
    <div>Home, Welcome {user? user.user_id: 'shreyank'}</div>
  )
}

export default Home