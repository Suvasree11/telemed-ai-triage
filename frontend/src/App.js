import React from "react";
import Chatbot from "./components/Chatbot";
import "./App.css";
 

function App() {
  return (
    <div className="app-wrapper">
       <span> <img src="/logo.png"  alt="Telemed Guide Logo" className="logo" /></span>

      {/* <h1 className="app-heading">🩺  Telemed Guide</h1> */}
      <Chatbot />
    </div>
  );
}

export default App;