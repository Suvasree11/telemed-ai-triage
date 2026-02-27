import React, { useState } from "react";
import axios from "axios";
import "./chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hi 👋 What are your symptoms?", sender: "bot" }
  ]);

  const [input, setInput] = useState("");
  const [step, setStep] = useState("symptoms");
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const formatTriageResponse = (triage) => {
    let response = "";

    if (triage.risk_level) {
      response += `🩺 Risk Level: ${triage.risk_level}\n\n`;
    }

    if (triage.summary) {
      response += `📋 Summary:\n${triage.summary}\n\n`;
    }

    if (triage.possible_conditions?.length) {
      response += `🧠 Possible Conditions:\n${triage.possible_conditions.join(", ")}\n\n`;
    }

    if (triage.recommended_specialist) {
      response += `👨‍⚕ Recommended Specialist:\n${triage.recommended_specialist}\n\n`;
    }

    if (triage.otc_medicines?.length) {
      response += `💊 OTC Medicines:\n${triage.otc_medicines.join(", ")}\n\n`;
    }

    if (triage.red_flags?.length) {
      response += `🛑 Red Flags:\n${triage.red_flags.join(", ")}\n\n`;
    }

    if (triage.follow_up_questions?.length) {
      response += `❓ Follow-up Questions:\n- ${triage.follow_up_questions.join("\n- ")}\n\n`;
    }

    response += "Please consult a doctor for proper diagnosis.";

    return response.trim();
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);

    // STEP 1 - Capture Symptoms
    if (step === "symptoms") {
      setSymptoms(input);
      setInput("");
      setStep("age");

      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { text: "Please enter your age.", sender: "bot" }
        ]);
      }, 500);

      return;
    }

    // STEP 2 - Capture Age & Call API
    if (step === "age") {
      if (isNaN(input) || Number(input) <= 0) {
        setMessages(prev => [
          ...prev,
          { text: "⚠ Age must be a valid number.", sender: "bot" }
        ]);
        setInput("");
        return;
      }

      setAge(input);
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_HOST}/api/ai/chat`,
          { symptoms, age: input }
        );

        setLoading(false);

        const { triage, emergency } = res.data;

        setIsEmergency(emergency);

        const botReply = {
          text: emergency
            ? "⚠️ This may require immediate medical attention. Please visit nearest hospital."
            : formatTriageResponse(triage),
          sender: "bot"
        };

        setMessages(prev => [...prev, botReply]);
        setStep("chat");

      } catch (err) {
        setLoading(false);
        setMessages(prev => [
          ...prev,
          { text: "❌ Something went wrong.", sender: "bot" }
        ]);
      }

      return;
    }

    // STEP 3 - Follow-up Chat
    if (step === "chat") {
      setInput("");
      setLoading(true);

      try {
        const res = await axios.post(
          `${process.env.REACT_APP_HOST}/api/ai/chat`,
          {
            symptoms,
            age,
            followup: input
          }
        );

        setLoading(false);

        const { triage, emergency } = res.data;

        setIsEmergency(emergency);

        const botReply = {
          text: emergency
            ? "⚠️ This may require immediate medical attention."
            : formatTriageResponse(triage),
          sender: "bot"
        };

        setMessages(prev => [...prev, botReply]);

      } catch (err) {
        setLoading(false);
        setMessages(prev => [
          ...prev,
          { text: "❌ Something went wrong.", sender: "bot" }
        ]);
      }

      return;
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender}`}>
            <pre style={{ whiteSpace: "pre-wrap" }}>{msg.text}</pre>
          </div>
        ))}

        {loading && (
          <div className="chat-bubble bot typing">
            Typing...
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type here..."
          onKeyDown={e => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chatbot;