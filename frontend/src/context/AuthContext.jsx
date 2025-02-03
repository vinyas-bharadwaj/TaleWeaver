import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AuthContext = React.createContext();
export default AuthContext;

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    
    // Get tokens from localStorage
    const storedTokens = localStorage.getItem("authTokens");

    let [authTokens, setAuthTokens] = useState(() => storedTokens ? JSON.parse(storedTokens) : null);
    let [user, setUser] = useState(() => storedTokens ? jwtDecode(JSON.parse(storedTokens).access) : null);

    // Sign up function
    let signupUser = async (e) => {
        e.preventDefault();
        console.log("Signup function called");

        if (e.target.password.value !== e.target.confirmPassword.value) {
            alert("Passwords do not match!");
            return;
        }

        let response = await fetch("http://127.0.0.1:8000/user/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: e.target.username.value,
                email: e.target.email.value,
                password: e.target.password.value,
            }),
        });

        if (response.status === 201) {
            navigate("/login");
        } else {
            alert("Something went wrong, try again");
        }
    };

    // Login function
    let loginUser = async (e) => {
        e.preventDefault();
        let response = await fetch("http://127.0.0.1:8000/api/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: e.target.username.value,
                password: e.target.password.value,
            }),
        });

        let data = await response.json();

        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem("authTokens", JSON.stringify(data));
            navigate("/");
        } else {
            alert("Something went wrong");
        }
    };

    // Refresh token function
    let updateToken = async () => {
        if (!authTokens) return;

        try {
            let response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: authTokens.refresh }),
            });

            let data = await response.json();
            
            if (response.status === 200) {
                data["refresh"] = authTokens.refresh; // Keep the refresh token
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem("authTokens", JSON.stringify(data));
            } else {
                logoutUser();
            }
        } catch (error) {
            console.error("Error refreshing token:", error);
            logoutUser();
        }
    };

    // Logout function
    let logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        navigate("/login");
    };

    let contextData = {
        signupUser,
        loginUser,
        logoutUser,
        user,
    };

    // Run refresh token at intervals and on mount
    useEffect(() => {
        if (authTokens) {
            // Call the refresh token once on mount
            updateToken();
            const interval = setInterval(() => {
                updateToken();
            }, 4 * 60 * 1000); // Refresh token every 4 minutes
    
            return () => clearInterval(interval); // Clean up the interval on component unmount
        }
    }, []); 
    

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
