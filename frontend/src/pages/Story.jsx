import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Story.module.scss";

const Story = () => {
    const [title, setTitle] = useState("");
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const [storyId, setStoryId] = useState(null);
    const navigate = useNavigate();
    const authTokens = localStorage.getItem("authTokens");
    const access = JSON.parse(authTokens)?.access;

    const handleTitleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("https://taleweaver-t7zq.onrender.com/story/create-story/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify({ title }),
            });
            const data = await response.json();
            if (response.status === 201) {
                localStorage.setItem("storyDetails", JSON.stringify(data));
                setStoryId(data.id);
                setShowPrompt(true);
            } else {
                alert("Failed to create story");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const handlePromptSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        const requestData = {
            story_id: storyId,
            starting_prompt: prompt
        };

        console.log(requestData);
    
        try {
            const response = await fetch("https://taleweaver-t7zq.onrender.com/story/generate-story/", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify(requestData),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Save the response data to localStorage
                localStorage.setItem('storyResponse', JSON.stringify(data));
                console.log('succesfully generated story', data);
                // Navigate to the chat page
                navigate("/chat");
            } else {
                console.error("Failed to generate story:", data);
                alert("Failed to generate story");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className={styles.storyContainer}>
            <h1 className={styles.storyTitle}>Create Your Story</h1>
            {!showPrompt ? (
                <form onSubmit={handleTitleSubmit} className={styles.storyForm}>
                    <input
                        type="text"
                        placeholder="Story Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.inputField}
                        required
                    />
                    <button
                        type="submit"
                        className={styles.createButton}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Next"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handlePromptSubmit} className={styles.storyForm}>
                    <textarea
                        placeholder="Initial Prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className={styles.textareaField}
                        rows="4"
                        required
                    />
                    <button
                        type="submit"
                        className={styles.createButton}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Story"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default Story;