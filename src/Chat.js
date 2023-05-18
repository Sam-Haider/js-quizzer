import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const MainContainer = styled.div`
  // Style your main container here
`;

const Chat = () => {
  const [topic, setTopic] = useState("javascript");
  const [level, setLevel] = useState("beginner");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);

  const handleTopicChange = (event) => {
    setTopic(event.target.value);
  };

  const handleLevelChange = (event) => {
    setLevel(event.target.value);
  };

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };

  const getQuizQuestion = async () => {
    setFeedback("");
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Imagine you're a virtual tutor. Give me a ${level} quiz question on ${topic}.`,
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
      setQuestion(assistantMessage);
    } catch (error) {
      console.error(error);
    }
  };

  // This will run when the component mounts
  useEffect(() => {
    getQuizQuestion();
  }, []);

  const assessAnswer = async () => {
    try {
      const payload = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Score this answer to the following ${level} ${topic} question, '${question}', on a scale of 0 to 100 and provide feedback. Answer: '${answer}'. In your response, start with the score, then </>, then the rest of your response. For example: 99</>Great job!`,
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
      // This assumes the AI returns the score as the first part of its response, followed by the feedback
      console.log({ assistantMessage });
      const [score, ...feedback] = assistantMessage.split("</>");
      setScore(Number(score.trim()));
      setFeedback(feedback.join("."));
      setAnswer(""); // Reset the answer
    } catch (error) {
      console.error(error);
    }
  };

  console.log({ score });

  return (
    <MainContainer>
      <h1>ChatGPT</h1>

      <label>Topic: </label>
      <select value={topic} onChange={handleTopicChange}>
        <option value="javascript">JavaScript</option>
        <option value="react">React</option>
      </select>

      <label>Level: </label>
      <select value={level} onChange={handleLevelChange}>
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <button onClick={getQuizQuestion}>Get Another Question</button>

      {question && (
        <>
          <h2>Question:</h2>
          <p>{question}</p>

          <h2>Your Answer:</h2>
          <input type="text" value={answer} onChange={handleAnswerChange} />
          <button onClick={assessAnswer}>Submit Answer</button>
        </>
      )}

      {feedback && (
        <>
          <h2>Feedback:</h2>
          <p>{feedback}</p>
          <p>Score: {score}</p>
        </>
      )}
    </MainContainer>
  );
};

export default Chat;
