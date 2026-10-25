import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { quizQuestionBank } from "../data/quizQuestions";
import "../styles/learningTools.css";

const HISTORY_KEY = "studygenie-quiz-history";

function readHistory() {
  try {
    const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function QuizAssessment() {
  const [subject, setSubject] = useState("DBMS");
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState(readHistory);
  const [showReview, setShowReview] = useState(false);
  const [reviewAnswers, setReviewAnswers] = useState(false);

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const startQuiz = () => {
    setQuiz(quizQuestionBank[subject]);
    setCurrentQuestion(0);
    setAnswers({});
    setShowReview(false);
    setReviewAnswers(false);
  };

  const finishQuiz = () => {
    const score = quiz.reduce(
      (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
      0,
    );
    const attempt = {
      id: Date.now(),
      subject,
      score,
      total: quiz.length,
      date: new Date().toISOString(),
    };
    setHistory((previous) => [attempt, ...previous].slice(0, 8));
    setShowReview(true);
  };

  const score = quiz
    ? quiz.reduce(
        (total, item, index) => total + (answers[index] === item.answer ? 1 : 0),
        0,
      )
    : 0;
  const question = quiz?.[currentQuestion];
  const isAnswered = quiz && Object.keys(answers).length === quiz.length;
  const bestScore = history.reduce(
    (best, item) => Math.max(best, Math.round((item.score / item.total) * 100)),
    0,
  );

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain learningMain">
        <Topbar />
        <section className="learningPageIntro">
          <div>
            <span className="learningEyebrow">PRACTICE & GROW</span>
            <h1>Quiz &amp; Assessment</h1>
            <p>Test what you know, review every answer, and keep track of your progress.</p>
          </div>
          {quiz && !showReview && (
            <button className="learningSecondaryButton" onClick={() => setQuiz(null)}>
              Exit quiz
            </button>
          )}
        </section>

        {!quiz ? (
          <div className="learningGrid quizLandingGrid">
            <section className="learningCard quizSetupCard">
              <div className="learningCardHeading">
                <div className="learningIcon">✦</div>
                <div>
                  <h2>Ready for a quick challenge?</h2>
                  <p>Choose a subject and start a five-question practice quiz.</p>
                </div>
              </div>
              <label className="learningLabel" htmlFor="quiz-subject">Choose a subject</label>
              <div className="subjectOptions" role="group" aria-label="Quiz subject">
                {Object.keys(quizQuestionBank).map((item) => (
                  <button
                    className={`subjectOption ${subject === item ? "selected" : ""}`}
                    key={item}
                    onClick={() => setSubject(item)}
                    type="button"
                  >
                    <span>{item === "DBMS" ? "🗄️" : item === "Java" ? "☕" : "⚙️"}</span>
                    <strong>{item}</strong>
                    <small>5 questions · 5 min</small>
                  </button>
                ))}
              </div>
              <button className="learningPrimaryButton" onClick={startQuiz}>
                Start {subject} quiz <span aria-hidden="true">→</span>
              </button>
              <div className="quizNote"><span>✦</span> Instant results with explanations for every question</div>
            </section>

            <aside className="learningCard quizProgressCard">
              <div className="learningCardTitleRow">
                <h2>Your practice</h2><span className="learningTitleIcon">▥</span>
              </div>
              <div className="practiceScore">
                <div className="scoreRing" style={{ "--score": `${bestScore}%` }}>
                  <strong>{bestScore}%</strong>
                </div>
                <div><strong>Personal best</strong><span>Keep building your streak</span></div>
              </div>
              <div className="practiceStats">
                <div><strong>{history.length}</strong><span>Quizzes taken</span></div>
                <div><strong>{history.length ? `${Math.round(history.reduce((sum, item) => sum + item.score / item.total, 0) / history.length * 100)}%` : "—"}</strong><span>Average score</span></div>
              </div>
              <div className="recentQuizHeader"><strong>Recent attempts</strong></div>
              {history.length ? (
                <ul className="quizHistoryList">
                  {history.slice(0, 4).map((attempt) => (
                    <li key={attempt.id}>
                      <span className="quizHistoryDot">✓</span>
                      <span><strong>{attempt.subject}</strong><small>{new Date(attempt.date).toLocaleDateString()}</small></span>
                      <b>{attempt.score}/{attempt.total}</b>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="learningEmptyNote">Your completed quizzes will show up here.</p>
              )}
            </aside>
          </div>
        ) : showReview ? (
          <section className="learningCard quizResultCard">
            <div className="resultIllustration">{score === quiz.length ? "🏆" : score >= 3 ? "✨" : "🌱"}</div>
            <span className="learningEyebrow">QUIZ COMPLETE</span>
            <h2>{score === quiz.length ? "Perfect score!" : score >= 3 ? "Nice work!" : "Good start — keep going!"}</h2>
            <p>You scored <strong>{score} out of {quiz.length}</strong> in {subject}.</p>
            <div className="resultBar"><span style={{ width: `${(score / quiz.length) * 100}%` }} /></div>
            <span className="resultPercent">{Math.round((score / quiz.length) * 100)}% correct</span>
            <div className="resultActions">
              <button className="learningPrimaryButton" onClick={() => setReviewAnswers((visible) => !visible)}>{reviewAnswers ? "Hide answer review" : "Review answers"}</button>
              <button className="learningSecondaryButton" onClick={startQuiz}>Try again</button>
              <button className="learningSecondaryButton" onClick={() => setQuiz(null)}>Choose another subject</button>
            </div>
            {reviewAnswers && (
              <div className="answerReviewList">
                {quiz.map((item, index) => (
                  <article className="answerReviewItem" key={`${item.question}-${index}`}>
                    <div className="reviewQuestionTitle">
                      <span className={`reviewMark ${answers[index] === item.answer ? "correct" : "incorrect"}`}>{answers[index] === item.answer ? "✓" : "×"}</span>
                      <strong>{item.question}</strong>
                    </div>
                    <p>Your answer: <b>{answers[index] === undefined ? "Not answered" : item.options[answers[index]]}</b></p>
                    <p>Correct answer: <b>{item.options[item.answer]}</b></p>
                    <small>{item.explanation}</small>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="learningCard activeQuizCard">
            <div className="quizProgressHeader">
              <div><span className="learningEyebrow">{subject.toUpperCase()} PRACTICE</span><h2>Question {currentQuestion + 1} <span>of {quiz.length}</span></h2></div>
              <span className="quizQuestionCount">{Object.keys(answers).length} answered</span>
            </div>
            <div className="questionProgressTrack"><span style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }} /></div>
            <div className="questionContent">
              <span className="questionNumber">QUESTION {String(currentQuestion + 1).padStart(2, "0")}</span>
              <h3>{question.question}</h3>
              <div className="quizAnswerOptions">
                {question.options.map((option, index) => (
                  <button
                    className={`quizAnswerOption ${answers[currentQuestion] === index ? "chosen" : ""}`}
                    key={option}
                    onClick={() => setAnswers((previous) => ({ ...previous, [currentQuestion]: index }))}
                    type="button"
                  >
                    <span className="answerLetter">{String.fromCharCode(65 + index)}</span>{option}
                    <span className="answerCheck">{answers[currentQuestion] === index ? "✓" : ""}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="quizNavigation">
              <button className="learningSecondaryButton" disabled={currentQuestion === 0} onClick={() => setCurrentQuestion((index) => index - 1)}>← Previous</button>
              {currentQuestion < quiz.length - 1 ? (
                <button className="learningPrimaryButton" onClick={() => setCurrentQuestion((index) => index + 1)}>Next question →</button>
              ) : (
                <button className="learningPrimaryButton" disabled={!isAnswered} onClick={finishQuiz}>Finish quiz <span>✓</span></button>
              )}
            </div>
            {!isAnswered && currentQuestion === quiz.length - 1 && <p className="quizFinishHint">Answer all questions before finishing.</p>}
          </section>
        )}
      </main>
    </div>
  );
}

export default QuizAssessment;
