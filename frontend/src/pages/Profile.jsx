import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/accountPages.css";

function readCachedUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}") || {};
  } catch {
    return {};
  }
}

function Profile() {
  const token = localStorage.getItem("token");
  const [form, setForm] = useState(() => {
    const user = readCachedUser();
    return {
      name: user.name || "",
      email: user.email || "",
      course: user.course || "B.Sc. IT",
      studyYear: user.studyYear || "TY",
    };
  });
  const [loading, setLoading] = useState(Boolean(token));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    axios.get("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      if (!active) return;
      const user = response.data.user;
      setForm({
        name: user.name || "",
        email: user.email || "",
        course: user.course || "B.Sc. IT",
        studyYear: user.studyYear || "TY",
      });
      localStorage.setItem("user", JSON.stringify(user));
    }).catch((error) => {
      if (active) {
        setMessage(error.response?.data?.message || "Could not load your account details.");
        setMessageType("error");
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [token]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setMessage("Sign in to update your profile.");
      setMessageType("error");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await axios.patch("/api/auth/me", {
        name: form.name,
        email: form.email,
        course: form.course,
        studyYear: form.studyYear,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        name: response.data.user.name,
        email: response.data.user.email,
        course: response.data.user.course || "B.Sc. IT",
        studyYear: response.data.user.studyYear || "TY",
      });
      localStorage.setItem("user", JSON.stringify(response.data.user));
      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not update your profile. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain accountMain">
        <Topbar />
        <section className="accountPageIntro">
          <div>
            <span className="accountEyebrow">YOUR ACCOUNT</span>
            <h1>My Profile</h1>
            <p>Keep your personal and study details up to date.</p>
          </div>
        </section>
        <section className="profileLayout">
          <article className="accountPanel profileSummaryPanel">
            <div className="profileLargeAvatar">{form.name ? form.name.trim().charAt(0).toUpperCase() : "S"}</div>
            <h2>{form.name || "Student"}</h2>
            <p>{form.course || "B.Sc. IT"} · {form.studyYear || "TY"}</p>
            <span className={`accountStatus ${token ? "signedIn" : ""}`}>{token ? "● Signed in" : "● Local preview"}</span>
          </article>

          <article className="accountPanel profileFormPanel">
            <div className="accountPanelHeading">
              <div><h2>Personal details</h2><p>Changes are saved to your account.</p></div>
              <span className="panelHeadingIcon">✎</span>
            </div>
            {loading ? <div className="progressEmptyNote">Loading your profile…</div> : (
              <form className="accountForm" onSubmit={handleSubmit}>
                <div className="accountFormField">
                  <label htmlFor="profile-name">Full name</label>
                  <input id="profile-name" name="name" value={form.name} onChange={handleChange} minLength="2" maxLength="80" required />
                </div>
                <div className="accountFormField">
                  <label htmlFor="profile-email">Email address</label>
                  <input id="profile-email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
                </div>
                <div className="accountFormRow">
                  <div className="accountFormField">
                    <label htmlFor="profile-course">Course</label>
                    <input id="profile-course" name="course" value={form.course} onChange={handleChange} maxLength="80" />
                  </div>
                  <div className="accountFormField">
                    <label htmlFor="profile-year">Study year</label>
                    <select id="profile-year" name="studyYear" value={form.studyYear} onChange={handleChange}>
                      <option value="FY">First year</option>
                      <option value="SY">Second year</option>
                      <option value="TY">Third year</option>
                      <option value="Final Year">Final year</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                {message && <p className={`accountFormMessage ${messageType}`} role={messageType === "error" ? "alert" : "status"}>{message}</p>}
                {!token && <p className="accountHint">Sign in to save profile changes.</p>}
                <button className="accountPrimaryButton" type="submit" disabled={saving || loading || !token}>
                  {saving ? "Saving…" : "Save profile"}
                </button>
              </form>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}

export default Profile;
