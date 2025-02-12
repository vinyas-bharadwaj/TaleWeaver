import React, { useState, useEffect, useContext } from "react";
import styles from "../styles/Profile.module.scss";
import AuthContext from "../context/AuthContext";

const Profile = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    dateOfBirth: "",
    profilePicture: null,
    address: "",
    bio: "",
  });
  const [profileExists, setProfileExists] = useState(false);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    let authTokens = localStorage.getItem("authTokens");
    let tokens = JSON.parse(authTokens);
    let accessToken = tokens?.access;

    try {
      const response = await fetch("https://taleweaver-t7zq.onrender.com/user/profile/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          displayName: data.display_name || "",
          email: data.email_address || "",
          dateOfBirth: data.date_of_birth || "",
          profilePicture: null, // Profile picture is handled separately
          address: data.address || "",
          bio: data.bio || "",
        });
        setProfileExists(true);
      } else if (response.status === 404) {
        setProfileExists(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData({ ...formData, profilePicture: e.target.files[0] });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("display_name", formData.displayName);
    formDataToSend.append("email_address", formData.email);
    formDataToSend.append("date_of_birth", formData.dateOfBirth);
    formDataToSend.append("address", formData.address);
    formDataToSend.append("bio", formData.bio);

    if (formData.profilePicture) {
      formDataToSend.append("profile_pic", formData.profilePicture);
    }

    let authTokens = localStorage.getItem("authTokens");
    let tokens = JSON.parse(authTokens);
    let accessToken = tokens?.access;

    try {
      const response = await fetch("https://taleweaver-t7zq.onrender.com/user/profile/", {
        method: profileExists ? "PUT" : "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const responseData = await response.json();
      console.log("Profile updated successfully:", responseData);
      alert("Profile updated successfully!");
      setProfileExists(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile: " + error.message);
    }
  };

  return (
    <div className={styles["profile-container"]}>
      <div className={styles["profile-form"]}>
        <div className={styles["profile-picture-section"]}>
          <div className={styles["file-upload"]}>
            <input
              type="file"
              name="profilePicture"
              onChange={handleFileChange}
              id="file-upload-input"
              className={styles["file-upload-input"]}
            />
            <label htmlFor="file-upload-input" className={styles["file-upload-button"]}>
              Profile Pic
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles["input-group"]}>
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              placeholder="Enter your display name"
              required
            />
          </div>

          <div className={styles["input-group"]}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              required
            />
          </div>

          <div className={styles["input-group"]}>
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles["input-group"]}>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your address"
            />
          </div>

          <div className={styles["input-group"]}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Write something about yourself"
            ></textarea>
          </div>

          <button type="submit" className={styles["profile-button"]}>
            {profileExists ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
