import React, {useState, useEffect} from "react";
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();

export default AuthContext;

export const AuthProvider = ({children}) => {
    const tokens = localStorage.getItem('authTokens');

    let [user, setUser] = useState(() => tokens? JSON.parse(tokens).user_id : null);
    let [authTokens, setAuthTokens] = useState(() => tokens? JSON.parse(tokens): null);
    let navigate = useNavigate()

    let signupUser = async (e) => {
        e.preventDefault();
        let response = await fetch('http://127.0.0.1:8000/user/create/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }, 
            body: JSON.stringify({
                'username': e.target.username.value, 
                'email': e.target.email.value, 
                'password': e.target.password.value})
            })

        let data = await response.json();
        console.log(data);
        if (response.status === 201) {
            navigate('/login');
        } else {
            alert('something went wrong, try again');
        }
        
    }

    let loginUser = async (e) => {
        e.preventDefault();
        let response = await fetch('http://127.0.0.1:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({'username': e.target.username.value, 'password': e.target.password.value})
        })

        let data = await response.json();
        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/')
        } else {
            alert('Something went wrong');
        }
    }

    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }

    let contextData = {
        signupUser: signupUser,
        loginUser: loginUser,
        logoutUser: logoutUser,
        user: user
    }


    return(
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    )
}

