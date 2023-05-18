import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const MainContainer = styled.div`
  margin: 0 auto;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background-color: #1a1a2e;
  color: #fff;
  font-size: 18px;

  h1 {
    color: #78dad3;
    font-size: 2rem;
  }

  label {
    color: #adfffe;
    margin-right: 10px;
  }

  select,
  input[type="text"] {
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #16213e;
    color: #fff;
    margin-bottom: 20px;
    width: 100%;
  }

  .select-dropdown {
    font-size: 20px;
  }

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #0f3460;
    color: #fff;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .submit-answer-button {
    background-color: #ff68a3;
  }

  .subheading {
    margin: 0 0 40px 0;
    padding: 0;
  }
`;

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #0f3460;
  padding: 20px;
  border-radius: 10px;
  width: 96%;
  max-width: 750px;
  margin-bottom: 20px;

  h2 {
    color: #ff68a3;
    margin-bottom: 10px;
  }
`;

const FeedbackContainer = styled(QuestionContainer)`
  background-color: #16213e;
`;

const Chat = () => {
  const [topic, setTopic] = useState("javascript");
  const [level, setLevel] = useState("beginner");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [getQuestionText, setGetQuestionText] = useState("Quiz Me!");

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
    setGetQuestionText("Get a new question");
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

  useEffect(() => {
    // TODO: NEED TO UNDO THIS
    // getQuizQuestion();
  }, []);

  useEffect(() => {
    if (feedback) {
      setIsLoading(false);
    }
  }, [feedback, setIsLoading]);

  const assessAnswer = async () => {
    setIsLoading(true);
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
      const [score, ...feedback] = assistantMessage.split("</>");
      setScore(Number(score.trim()));
      setFeedback(feedback.join("."));
      setAnswer(""); // Reset the answer
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainContainer>
      <h1>React and JS Quizzer</h1>
      <p className="subheading">Powered by OpenAI's GPT-3.5 Turbo</p>

      <label>Topic </label>
      <select
        className="select-dropdown"
        value={topic}
        onChange={handleTopicChange}
      >
        <option value="javascript">JavaScript</option>
        <option value="react">React</option>
      </select>

      <label>Level </label>
      <select
        className="select-dropdown"
        value={level}
        onChange={handleLevelChange}
      >
        <option value="beginner">Beginner</option>
        <option value="intermediate">Intermediate</option>
        <option value="advanced">Advanced</option>
      </select>

      <button onClick={getQuizQuestion}>{getQuestionText}</button>

      {question && (
        <QuestionContainer>
          <h2>Question:</h2>
          <p>{question}</p>

          <h2>Your Answer:</h2>
          <input type="text" value={answer} onChange={handleAnswerChange} />
          <button className="submit-answer-button" onClick={assessAnswer}>
            Submit Answer
          </button>
          {isLoading && <div>Analyzing your response...</div>}
        </QuestionContainer>
      )}

      {feedback && (
        <FeedbackContainer>
          <h2>Feedback:</h2>
          <p>{feedback}</p>
          <p>Score: {score}</p>
        </FeedbackContainer>
      )}
    </MainContainer>
  );
};

export default Chat;
