import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

function formatDate(date) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Date unavailable"
    : parsed.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Dashboard() {
  const [materials, setMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [hasToken] = useState(() => Boolean(localStorage.getItem("token")));
  const [loading, setLoading] = useState(hasToken);
  const [error, setError] = useState(
    hasToken ? "" : "Sign in to see your saved study activity."
  );
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("token");

    if (!token) {
      return () => { active = false; };
    }

    Promise.all([
      axios.get("/api/materials", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("/api/ai/notes", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("/api/quizzes/history", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(([materialsResponse, notesResponse, quizHistoryResponse]) => {
        if (!active) return;
        setMaterials(Array.isArray(materialsResponse.data) ? materialsResponse.data : []);
        setNotes(Array.isArray(notesResponse.data) ? notesResponse.data : []);
        setQuizHistory(Array.isArray(quizHistoryResponse.data) ? quizHistoryResponse.data : []);
      })
      .catch(() => {
        if (active) {
          setError("Could not load your saved activity. Check your connection and try again.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reloadKey]);

  const averageScore = quizHistory.length
    ? Math.round(
      quizHistory.reduce((total, attempt) => {
        const score = Number(attempt.score) || 0;
        const totalQuestions = Number(attempt.total) || 0;
        return total + (totalQuestions ? score / totalQuestions : 0);
      }, 0) / quizHistory.length * 100
    )
    : null;

  const recentActivity = useMemo(() => [
    ...materials.map((material) => ({
      id: `material-${material._id}`,
      icon: "📁",
      title: `Uploaded ${material.originalName}`,
      date: material.createdAt
    })),
    ...notes.map((note) => ({
      id: `note-${note._id}`,
      icon: "✦",
      title: `Generated ${note.noteType || "AI notes"}: ${note.title}`,
      date: note.createdAt
    })),
    ...quizHistory.map((attempt) => ({
      id: `quiz-${attempt.id}`,
      icon: "✓",
      title: `Completed ${attempt.materialName || attempt.subject || "study"} quiz · ${attempt.score}/${attempt.total}`,
      date: attempt.date
    }))
  ]
    .filter((item) => item.date && !Number.isNaN(new Date(item.date).getTime()))
    .sort((first, second) => new Date(second.date) - new Date(first.date))
    .slice(0, 6), [materials, notes, quizHistory]);

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain">
        <Topbar />

        <section className="dashboardQuickLinks" aria-label="Study actions">
          <div>
            <h2>Your study space</h2>
            <p>Pick up where you left off with your own materials and practice.</p>
          </div>
          <div className="dashboardActionLinks">
            <Link className="dashboardActionSecondary" to="/materials">Manage materials</Link>
            <Link className="dashboardActionPrimary" to="/quiz">Create a quiz <span aria-hidden="true">→</span></Link>
          </div>
        </section>

        {error && (
          <div className="dashboardNotice" role="alert">
            <span>{error}</span>
            {localStorage.getItem("token") && (
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError("");
                  setReloadKey((key) => key + 1);
                }}
              >
                Try again
              </button>
            )}
          </div>
        )}

        <section className="dashboardStats" aria-label="Your study statistics">
          <StatCard icon="📚" title="Study materials" value={loading ? "…" : materials.length} subtitle="Files in your library" />
          <StatCard icon="✦" title="AI notes & summaries" value={loading ? "…" : notes.length} subtitle="Saved to your account" />
          <StatCard icon="✓" title="Quizzes completed" value={quizHistory.length} subtitle="Your practice attempts" />
          <StatCard icon="◎" title="Average quiz score" value={averageScore === null ? "—" : `${averageScore}%`} subtitle={averageScore === null ? "Complete a quiz to begin" : "Across your attempts"} />
        </section>

        <section className="dashboardBottom dashboardRealDataGrid">
          <div className="dashboardCard">
            <div className="dashboardCardHeader">
              <h2>Recent activity</h2>
              <Link to="/progress">Progress</Link>
            </div>
            {loading ? (
              <p className="dashboardEmptyState">Loading your activity…</p>
            ) : recentActivity.length ? (
              <div className="dashboardActivityList">
                {recentActivity.map((item) => (
                  <article className="dashboardActivityItem" key={item.id}>
                    <span className="dashboardActivityIcon" aria-hidden="true">{item.icon}</span>
                    <p>{item.title}</p>
                    <time dateTime={new Date(item.date).toISOString()}>{formatDate(item.date)}</time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="dashboardEmptyState">
                <p>Your uploads, AI summaries, and quiz attempts will show here.</p>
                <Link to="/materials">Upload your first study material</Link>
              </div>
            )}
          </div>

          <div className="dashboardCard dashboardLibraryCard">
            <div className="dashboardCardHeader">
              <h2>Study materials</h2>
              <Link to="/materials">View all</Link>
            </div>
            {loading ? (
              <p className="dashboardEmptyState">Loading your library…</p>
            ) : materials.length ? (
              <div className="dashboardMaterialList">
                {materials.slice(0, 5).map((material) => (
                  <div className="dashboardMaterialItem" key={material._id}>
                    <span className="dashboardMaterialIcon" aria-hidden="true">📄</span>
                    <div><strong>{material.originalName}</strong><small>{material.subject || "General"} · {formatDate(material.createdAt)}</small></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dashboardEmptyState">
                <p>No files uploaded yet.</p>
                <Link to="/materials">Go to study materials</Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
