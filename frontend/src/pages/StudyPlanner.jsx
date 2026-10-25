import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/learningTools.css";

const PLANNER_KEY = "studygenie-study-plan";
const dayFormat = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function getInitialPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(PLANNER_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function getPlannerPreferences() {
  try {
    return JSON.parse(localStorage.getItem("studygenie-study-settings") || "{}");
  } catch {
    return {};
  }
}

function getWeekDays(anchor) {
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function StudyPlanner() {
  const [plan, setPlan] = useState(getInitialPlan);
  const [preferences] = useState(getPlannerPreferences);
  const [weekOffset, setWeekOffset] = useState(0);
  const today = dayFormat(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(preferences.defaultSubject || "DBMS");
  const [time, setTime] = useState("09:00");
  const [duration, setDuration] = useState(String(preferences.defaultSessionLength || 45));

  const weekAnchor = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + weekOffset * 7);
    return date;
  }, [weekOffset]);
  const days = useMemo(() => getWeekDays(weekAnchor), [weekAnchor]);
  const selectedTasks = plan
    .filter((task) => task.date === selectedDate)
    .sort((a, b) => a.time.localeCompare(b.time));
  const weekTasks = plan.filter((task) => days.some((day) => dayFormat(day) === task.date));
  const weekDone = weekTasks.filter((task) => task.done).length;
  const totalMinutes = weekTasks.reduce((total, task) => total + Number(task.duration || 0), 0);

  const persistPlan = (nextPlan) => {
    setPlan(nextPlan);
    localStorage.setItem(PLANNER_KEY, JSON.stringify(nextPlan));
  };

  const addSession = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    persistPlan([
      ...plan,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: title.trim(),
        subject,
        date: selectedDate,
        time,
        duration: Number(duration),
        done: false,
      },
    ]);
    setTitle("");
  };

  const moveWeek = (delta) => {
    const nextOffset = weekOffset + delta;
    setWeekOffset(nextOffset);
    const date = new Date();
    date.setDate(date.getDate() + nextOffset * 7);
    setSelectedDate(dayFormat(date));
  };

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain learningMain">
        <Topbar />
        <section className="learningPageIntro plannerIntro">
          <div>
            <span className="learningEyebrow">A LITTLE PROGRESS, EVERY DAY</span>
            <h1>Study Planner</h1>
            <p>Make a plan that works for you, and celebrate every session you complete.</p>
          </div>
          <div className="plannerWeekActions">
            <button className="learningSecondaryButton" onClick={() => moveWeek(-1)} aria-label="Previous week">←</button>
            <button className="learningSecondaryButton" onClick={() => { setWeekOffset(0); setSelectedDate(today); }}>Today</button>
            <button className="learningSecondaryButton" onClick={() => moveWeek(1)} aria-label="Next week">→</button>
          </div>
        </section>

        <section className="plannerStatsGrid">
          <article className="plannerStatCard"><span className="plannerStatIcon lavender">▦</span><div><strong>{weekTasks.length}</strong><span>Sessions this week</span></div></article>
          <article className="plannerStatCard"><span className="plannerStatIcon mint">✓</span><div><strong>{weekDone}</strong><span>Sessions completed</span></div></article>
          <article className="plannerStatCard"><span className="plannerStatIcon peach">◷</span><div><strong>{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</strong><span>Planned study time</span></div></article>
        </section>

        <section className="learningCard weekCalendarCard">
          <div className="learningCardTitleRow">
            <div><h2>Your week at a glance</h2><p className="learningCardSubheading">{days[0].toLocaleDateString("en", { month: "long", day: "numeric" })} – {days[6].toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}</p></div>
            <span className="calendarTitleIcon">▦</span>
          </div>
          <div className="weekDayGrid">
            {days.map((day) => {
              const key = dayFormat(day);
              const count = plan.filter((task) => task.date === key).length;
              return (
                <button className={`weekDayButton ${selectedDate === key ? "selected" : ""} ${key === today ? "isToday" : ""}`} key={key} onClick={() => setSelectedDate(key)}>
                  <span>{day.toLocaleDateString("en", { weekday: "short" })}</span>
                  <strong>{day.getDate()}</strong>
                  <i className={count ? "hasSessions" : ""} aria-label={count ? `${count} sessions` : "No sessions"} />
                </button>
              );
            })}
          </div>
        </section>

        <div className="learningGrid plannerContentGrid">
          <section className="learningCard sessionListCard">
            <div className="learningCardTitleRow">
              <div><h2>{selectedDate === today ? "Today's sessions" : new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })}</h2><p className="learningCardSubheading">{selectedTasks.length} planned {selectedTasks.length === 1 ? "session" : "sessions"}</p></div>
              <span className="sessionCountBadge">{selectedTasks.filter((task) => task.done).length}/{selectedTasks.length} done</span>
            </div>
            {selectedTasks.length ? (
              <div className="sessionList">
                {selectedTasks.map((task) => (
                  <article className={`studySession ${task.done ? "completed" : ""}`} key={task.id}>
                    <button className="sessionCheckButton" onClick={() => persistPlan(plan.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))} aria-label={task.done ? "Mark session incomplete" : "Mark session complete"}>{task.done ? "✓" : ""}</button>
                    <div className="sessionTime">{task.time}<span>{task.duration} min</span></div>
                    <div className="sessionDetails"><strong>{task.title}</strong><span>{task.subject}</span></div>
                    <button className="removeSessionButton" onClick={() => persistPlan(plan.filter((item) => item.id !== task.id))} aria-label={`Remove ${task.title}`}>×</button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="plannerEmptyState"><span>☀️</span><strong>A little space to focus</strong><p>No sessions planned for this day yet. Add one to get started.</p></div>
            )}
          </section>

          <section className="learningCard addSessionCard">
            <div className="learningCardTitleRow"><div><h2>Plan a session</h2><p className="learningCardSubheading">Small steps add up.</p></div><span className="addSessionIcon">＋</span></div>
            <form className="sessionForm" onSubmit={addSession}>
              <label htmlFor="session-title">What are you studying?</label>
              <input id="session-title" maxLength="80" placeholder="e.g. Revise normalization" value={title} onChange={(event) => setTitle(event.target.value)} required />
              <div className="sessionFormRow">
                <div><label htmlFor="session-subject">Subject</label><select id="session-subject" value={subject} onChange={(event) => setSubject(event.target.value)}><option>DBMS</option><option>Operating Systems</option><option>Java</option><option>Mathematics</option><option>Other</option></select></div>
                <div><label htmlFor="session-date">Date</label><input id="session-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} required /></div>
              </div>
              <div className="sessionFormRow">
                <div><label htmlFor="session-time">Start time</label><input id="session-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} required /></div>
                <div><label htmlFor="session-duration">Duration</label><select id="session-duration" value={duration} onChange={(event) => setDuration(event.target.value)}><option value="25">25 minutes</option><option value="45">45 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option></select></div>
              </div>
              <button className="learningPrimaryButton" type="submit">＋ Add to my plan</button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default StudyPlanner;
