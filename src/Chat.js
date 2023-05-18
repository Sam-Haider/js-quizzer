import React, { useState } from "react";
import axios from "axios";
import styled from "styled-components";

const MainContainer = styled.div`
  // Style your main container here
`;

const Chat = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [topic, setTopic] = useState("javascript"); // "javascript", "react", or "both"
  const [level, setLevel] = useState("beginner"); // "beginner", "intermediate", or "advanced"
  const [mode, setMode] = useState("learning topic"); // "learning topic" or "quiz question"
  const [streak, setStreak] = useState(0); // keep track of correct answers in a row

  const handleTopicChange = (event) => {
    setTopic(event.target.value);
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  const resetStreak = () => {
    setStreak(0);
  };

  const incrementStreak = () => {
    setStreak((prevStreak) => prevStreak + 1);
  };

  const sendMessage = async () => {
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Imagine you're a virtual tutor. Give me a ${level} ${mode} on ${topic}`,
          },
        ],
      };

      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI}`, // Replace with your actual API key
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content.trim();
      setResponse(assistantMessage);
      setMessage("");
    } catch (error) {
      console.error(error);
    }
  };

  console.log({ streak, incrementStreak, resetStreak });

  return (
    <MainContainer>
      <h1>ChatGPT</h1>
      <label>Topic: </label>
      <select value={topic} onChange={handleTopicChange}>
        <option value="javascript">JavaScript</option>
        <option value="react">React</option>
        <option value="both">Both</option>
      </select>
      <label>Level: </label>
      <select value={level} onChange={handleLevelChange}>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>
      <label>Mode: </label>
      <select value={mode} onChange={handleModeChange}>
        <option value="learning topic">Learning Topic</option>
        <option value="quiz question">Quiz Question</option>
      </select>
      <button onClick={sendMessage}>Send</button>
      <p>Streak: {streak}</p>
      {mode === "quiz question" && (
        <>
          <h2>Question:</h2>
          <p>{response}</p>

          <h2>Your Answer:</h2>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage}>Submit Answer</button>
        </>
      )}
      {mode === "learning topic" && (
        <>
          <h2>Learning Topic:</h2>
          <p>{response}</p>
        </>
      )}
    </MainContainer>
  );
};

export default Chat;
