import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // Import BrowserRouter and Route
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";  // Import Home component
import Login from "./pages/Login";  // Import Login component
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Story from "./pages/Story";
import Chat from "./pages/Chat";
import PrivateRoute from "./utils/PrivateRoute";

function App() {
  return (
    <Router> 
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home/>} /> 
          <Route path="/login" element={<Login />} /> 
          <Route path="/signup" element={<Signup />} />
          <Route path='/profile' element={<PrivateRoute><Profile/></PrivateRoute>}></Route>
          <Route path='/story' element={<PrivateRoute><Story/></PrivateRoute>}></Route>
          <Route path='/chat' element={<Chat />}></Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

