import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import "../styles/PrivateRoute.css"; 
import AuthContext from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
    const {user} = useContext(AuthContext);
    const [showAlert, setShowAlert] = useState(!user);

    if (!user) {
        return (
            <>
                {showAlert && (
                    <div className="alert-overlay">
                        <div className="alert-box">
                            <h2>Access Denied</h2>
                            <p>You must be logged in to access this page.</p>
                            <button onClick={() => setShowAlert(false)}>OK</button>
                        </div>
                    </div>
                )}
                {!showAlert && <Navigate to="/login" replace />}
            </>
        );
    }

    return children;
};

export default ProtectedRoute;
