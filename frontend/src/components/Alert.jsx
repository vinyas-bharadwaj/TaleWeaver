import React from "react";
import styles from "../styles/Alert.module.css"; 

const Alert = ({ title, message, buttonText, onClose }) => {
    return (
        <div className={styles["alert-overlay"]}>
            <div className={styles["alert-box"]}>
                <h2>{title}</h2>
                <p>{message}</p>
                <button onClick={onClose}>{buttonText || "OK"}</button>
            </div>
        </div>
    );
};

export default Alert;
