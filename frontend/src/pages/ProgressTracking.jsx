import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/accountPages.css";

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

function ProgressTracking() {
  const [period, setPeriod] = useState("30");
  const [now] = useState(() => Date.now());
  const quizzes = useMemo(() => readArray("studygenie-quiz-history"), []);
  const sessions = useMemo(() => readArray("studygenie-study-plan"), []);
  const settings = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studygenie-study-settings") || "{}");
    } catch {
      return {};
    }
  }, []);

  const cutoff = period === "all" ? 0 : now - Number(period) * 24 * 60 * 60 * 1000;
  const filteredQuizzes = quizzes.filter((quiz) => new Date(quiz.date).getTime() >= cutoff);
  const filteredSessions = sessions.filter((session) => new Date(`${session.date}T12:00:00`).getTime() >= cutoff);
  const averageScore = filteredQuizzes.length
    ? Math.round(filteredQuizzes.reduce((sum, quiz) => sum + (quiz.score / quiz.total) * 100, 0) / filteredQuizzes.length)
    : 0;
  const minutesStudied = filteredSessions
    .filter((session) => session.done)
    .reduce((sum, session) => sum + Number(session.duration || 0), 0);
  const completedSessions = filteredSessions.filter((session) => session.done).length;
  const sessionRate = filteredSessions.length
    ? Math.round((completedSessions / filteredSessions.length) * 100)
    : 0;
  const dailyGoal = Number(settings.dailyStudyGoal || 90);
  const goalMinutes = period === "all" ? null : Number(period) * dailyGoal;
  const goalRate = goalMinutes
    ? Math.min(100, Math.round((minutesStudied / goalMinutes) * 100))
    : 0;

  const subjectStats = Object.entries(
    filteredQuizzes.reduce((result, quiz) => {
      const subject = quiz.subject || "Other";
      result[subject] ||= { attempts: 0, score: 0 };
      result[subject].attempts += 1;
      result[subject].score += (quiz.score / quiz.total) * 100;
      return result;
    }, {}),
  )
    .map(([subject, stats]) => ({
      subject,
      attempts: stats.attempts,
      average: Math.round(stats.score / stats.attempts),
    }))
    .sort((a, b) => b.average - a.average);

  const recentActivity = [
    ...filteredQuizzes.map((quiz) => ({
      id: `quiz-${quiz.id}`,
      type: "quiz",
      title: `${quiz.subject} quiz`,
      detail: `${quiz.score}/${quiz.total} correct`,
      date: new Date(quiz.date),
    })),
    ...filteredSessions.filter((session) => session.done).map((session) => ({
      id: `session-${session.id}`,
      type: "study",
      title: session.title,
      detail: `${session.subject} · ${session.duration} min`,
      date: new Date(`${session.date}T${session.time || "12:00"}:00`),
    })),
  ]
    .sort((a, b) => b.date - a.date)
    .slice(0, 6);

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain accountMain">
        <Topbar />
        <section className="accountPageIntro">
          <div>
            <span className="accountEyebrow">YOUR LEARNING JOURNEY</span>
            <h1>Progress Tracking</h1>
            <p>See your quiz results and study sessions add up over time.</p>
          </div>
          <label className="periodFilter">
            <span>Show progress for</span>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </label>
        </section>

        <section className="accountMetricGrid" aria-label="Learning summary">
          <article className="accountMetricCard">
            <span className="accountMetricIcon purple">✦</span>
            <div><span>Quiz accuracy</span><strong>{filteredQuizzes.length ? `${averageScore}%` : "—"}</strong><small>{filteredQuizzes.length} {filteredQuizzes.length === 1 ? "attempt" : "attempts"}</small></div>
          </article>
          <article className="accountMetricCard">
            <span className="accountMetricIcon green">✓</span>
            <div><span>Sessions completed</span><strong>{completedSessions}</strong><small>of {filteredSessions.length} planned</small></div>
          </article>
          <article className="accountMetricCard">
            <span className="accountMetricIcon orange">◷</span>
            <div><span>Focused study time</span><strong>{Math.floor(minutesStudied / 60)}h {minutesStudied % 60}m</strong><small>from completed planner sessions</small></div>
          </article>
        </section>

        <section className="accountContentGrid">
          <article className="accountPanel">
            <div className="accountPanelHeading">
              <div><h2>Study goal</h2><p>Your daily target is {dailyGoal} minutes.</p></div>
              <span className="panelHeadingIcon">◎</span>
            </div>
            {period === "all" ? (
              <div className="progressEmptyNote">Choose a time period to compare your study time with your daily goal.</div>
            ) : (
              <>
                <div className="goalSummary"><strong>{minutesStudied} <span>min</span></strong><span>of {goalMinutes} min target</span></div>
                <div className="accountProgressTrack" role="progressbar" aria-label="Study goal progress" aria-valuenow={goalRate} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${goalRate}%` }} /></div>
                <p className="goalFootnote">{goalRate}% of your target reached in the selected {period} days</p>
              </>
            )}
            <div className="studyCompletionSummary">
              <span>Planned sessions completed</span><strong>{sessionRate}%</strong>
            </div>
          </article>

          <article className="accountPanel">
            <div className="accountPanelHeading">
              <div><h2>Quiz performance</h2><p>Average score by subject</p></div>
              <span className="panelHeadingIcon">✎</span>
            </div>
            {subjectStats.length ? (
              <div className="subjectProgressList">
                {subjectStats.map((item) => (
                  <div className="subjectProgressItem" key={item.subject}>
                    <div><strong>{item.subject}</strong><span>{item.attempts} {item.attempts === 1 ? "quiz" : "quizzes"}</span></div>
                    <b>{item.average}%</b>
                  </div>
                ))}
              </div>
            ) : (
              <div className="progressEmptyNote">Finish a quiz to see your results here.</div>
            )}
          </article>
        </section>

        <section className="accountPanel activityPanel">
          <div className="accountPanelHeading">
            <div><h2>Recent activity</h2><p>Your latest completed learning sessions</p></div>
            <span className="panelHeadingIcon">↻</span>
          </div>
          {recentActivity.length ? (
            <ul className="learningActivityList">
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <span className={`activityTypeIcon ${activity.type}`}>{activity.type === "quiz" ? "✦" : "✓"}</span>
                  <span className="activityDescription"><strong>{activity.title}</strong><small>{activity.detail}</small></span>
                  <time dateTime={activity.date.toISOString()}>{activity.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</time>
                </li>
              ))}
            </ul>
          ) : (
            <div className="progressEmptyNote">Your completed quizzes and sessions will appear here.</div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ProgressTracking;
