import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import BrowserRouter and Route
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";  // Import Home component
import Login from "./pages/Login";  // Import Login component
import Signup from "./pages/Signup";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
  return (
    <Router> 
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<PrivateRoute><Home/></PrivateRoute>} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

