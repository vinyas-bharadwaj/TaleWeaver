import { useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Alert from "../components/Alert";

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [showAlert, setShowAlert] = useState(!user);

    if (!user) {
        return (
            <>
                {showAlert && (
                    <Alert 
                        title="Access Denied" 
                        message="You must be logged in to access this page."
                        buttonText="OK"
                        onClose={() => setShowAlert(false)}
                    />
                )}
                {!showAlert && <Navigate to="/login" replace />}
            </>
        );
    }

    return children;
};

export default ProtectedRoute;
