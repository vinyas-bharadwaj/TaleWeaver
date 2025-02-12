import React, { useState, useEffect } from 'react';
import styles from "../styles/Chat.module.scss";

const Chat = () => {
    const [displayText, setDisplayText] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [storyData, setStoryData] = useState(null);
    const [typingSpeed] = useState(10);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [pdfLink, setPdfLink] = useState(null);  // New state for PDF link

    const authTokens = localStorage.getItem("authTokens");
    const access = JSON.parse(authTokens)?.access;

    useEffect(() => {
        const storyResponse = localStorage.getItem('storyResponse');
        if (storyResponse) {
            const parsedResponse = JSON.parse(storyResponse);
            setStoryData(parsedResponse);
            animateText(parsedResponse.next_block);
        }
    }, []);

    const animateText = (text) => {
        let currentIndex = 0;
        setIsTyping(true);

        const intervalId = setInterval(() => {
            if (currentIndex < text.length) {
                setDisplayText(text.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(intervalId);
                setIsTyping(false);
            }
        }, typingSpeed);

        return () => clearInterval(intervalId);
    };

    const generateNextStory = async (userChoice) => {
        setLoading(true);
        const storyId = JSON.parse(localStorage.getItem('storyDetails')).id;

        const requestData = {
            story_id: storyId,
            starting_prompt: "",
            user_choice: userChoice
        };

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
                setStoryData(data);
                localStorage.setItem('storyResponse', JSON.stringify(data));
                animateText(data.next_block);
            } else {
                console.error("Failed to generate next story block:", data);
                alert("Failed to generate the next part of the story");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const concludeStory = async () => {
        setLoading(true);
        const storyId = JSON.parse(localStorage.getItem('storyDetails')).id;

        try {
            const response = await fetch("https://taleweaver-t7zq.onrender.com/story/conclude-story/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${access}`,
                },
                body: JSON.stringify({ story_id: storyId }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsCompleted(true);
                animateText(data.final_block + "\n\nThank you for experiencing this story!");
            } else {
                console.error("Failed to conclude story:", data);
                alert("Failed to conclude the story");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    const downloadStoryPDF = async () => {
        setLoading(true);
        const storyId = JSON.parse(localStorage.getItem('storyDetails')).id;
    
        try {
            const response = await fetch(`https://taleweaver-t7zq.onrender.com/story/generate-pdf/${storyId}/`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${access}`,
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                // Convert relative path to absolute URL
                const backendUrl = "https://taleweaver-t7zq.onrender.com/";  // Change if using a different backend URL
                setPdfLink(`${backendUrl}${data.pdf_url}`);
            } else {
                console.error("Failed to generate PDF:", data);
                alert("Failed to generate the PDF");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    

    const handleOptionClick = (option) => {
        if (!loading) {
            generateNextStory(option);
        }
    };

    if (!storyData) return <div className={styles.loadingContainer}>Loading...</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.chatContainer}>
                <div className={styles.storyBlock}>
                    {displayText}
                    {isTyping && <span className={styles.cursor}>|</span>}
                </div>

                {!isTyping && !loading && !isCompleted && (
                    <div className={styles.optionsContainer}>
                        {Object.entries(storyData.options).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => handleOptionClick(value)}
                                className={styles.optionButton}
                                disabled={isTyping || loading}
                            >
                                {value}
                            </button>
                        ))}
                        <button
                            onClick={concludeStory}
                            className={`${styles.optionButton} ${styles.concludeButton}`}
                            disabled={isTyping || loading}
                        >
                            Conclude Story
                        </button>
                    </div>
                )}

                {loading && (
                    <div className={styles.loadingIndicator}>
                        Generating next part of the story...
                    </div>
                )}

                {isCompleted && (
                    <div className={styles.downloadContainer}>
                        <center>
                            <button
                                onClick={downloadStoryPDF}
                                className={`${styles.optionButton} ${styles.downloadButton}`}
                                disabled={loading}
                            >
                                Download Story
                            </button>
                        </center>
                        {pdfLink && (
                            <p>
                                Your story is ready!{" "}
                                <center>
                                <a href={pdfLink} target="_blank" rel="noopener noreferrer">
                                    <button className={styles.optionButton}>View PDF</button>
                                </a>
                                </center>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
