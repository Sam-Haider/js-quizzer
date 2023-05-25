import React, { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

const MainContainer = styled.div`
  margin: 0 auto;
  max-width: 800px;
  padding: 20px;
  min-height: 100vh;
  background-color: #1a1a2e;
  color: #fff;
  font-size: 18px;

  .title {
    color: #78dad3;
    font-size: 2rem;
    text-align: center;
  }

  .subtitle {
    margin: 0 0 40px 0;
    padding: 0;
    text-align: center;
  }

  .input-label {
    color: #adfffe;
  }

  select {
    font-size: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #16213e;
    color: #fff;
    margin-top: 10px;
    margin-bottom: 20px;
    width: 100%;
  }

  .answer {
    font-size: 20px;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #16213e;
    color: #fff;
    margin-top: 10px;
    margin-bottom: 20px;
    display: block;
    width: calc(100% - 20px);
  }

  .select-dropdown {
    font-size: 20px;
  }

  button {
    display: block;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    background-color: #0f3460;
    color: #fff;
    cursor: pointer;
    margin: 0 auto 20px auto;
    font-size: 16px;
  }

  .submit-answer-button {
    font-size: 16px;
    background-color: #ff68a3;
  }
`;

const QuestionContainer = styled.div`
  background-color: #1e2648;
  padding: 20px;
  border-radius: 10px;
  max-width: 750px;
  display: block;
  margin: 0 auto 20px auto;

  h2 {
    color: #ff68a3;
    margin-bottom: 10px;
  }
`;

const FeedbackContainer = styled(QuestionContainer)`
  background-color: #16213e;
`;

const Quizzer = () => {
  const [topic, setTopic] = useState("javascript");
  const [level, setLevel] = useState("beginner");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
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
    setIsLoadingQuestion(true);
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
      setIsLoadingFeedback(false);
    }
  }, [feedback, setIsLoadingFeedback]);

  useEffect(() => {
    if (question) {
      setIsLoadingQuestion(false);
    }
  }, [question, setIsLoadingQuestion]);

  const assessAnswer = async () => {
    setIsLoadingFeedback(true);
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
      <h1 className="title">React and JS Quizzer</h1>
      <p className="subtitle">Powered by OpenAI's GPT-3.5 Turbo</p>

      <label className="input-label">Topic </label>
      <select
        className="select-dropdown"
        value={topic}
        onChange={handleTopicChange}
      >
        <option value="javascript">JavaScript</option>
        <option value="react">React</option>
      </select>

      <label className="input-label">Level </label>
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
      {isLoadingQuestion && <div>Getting a question ready...</div>}

      {question && (
        <QuestionContainer>
          <h2>Question:</h2>
          <p>{question}</p>
          <h2>Your Answer:</h2>
          <input
            className="answer"
            type="text"
            value={answer}
            onChange={handleAnswerChange}
          />
          <button className="submit-answer-button" onClick={assessAnswer}>
            Submit Answer
          </button>
          {isLoadingFeedback && <div>Analyzing your response...</div>}
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

export default Quizzer;
