import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/accountPages.css";

const SETTINGS_KEY = "studygenie-study-settings";
const defaultSettings = {
  dailyStudyGoal: 90,
  defaultSessionLength: 45,
  defaultSubject: "DBMS",
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    return { ...defaultSettings, ...saved };
  } catch {
    return defaultSettings;
  }
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(true);
  };

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain accountMain">
        <Topbar />
        <section className="accountPageIntro">
          <div>
            <span className="accountEyebrow">MAKE STUDYGENIE YOURS</span>
            <h1>Settings</h1>
            <p>Set your study goals and choose the defaults that work for you.</p>
          </div>
          <span className="settingsSavedBadge">{saved ? "✓ Saved on this device" : "Saved on this device"}</span>
        </section>

        <section className="settingsPanels">
          <article className="accountPanel settingsPanel">
            <div className="accountPanelHeading">
              <div><h2>Study goals</h2><p>Choose a daily target to keep your progress on track.</p></div>
              <span className="panelHeadingIcon">◎</span>
            </div>
            <label className="settingRow" htmlFor="daily-goal">
              <span><strong>Daily study goal</strong><small>Minutes you plan to study each day. Used on your Progress Tracking page.</small></span>
              <select id="daily-goal" value={settings.dailyStudyGoal} onChange={(event) => updateSetting("dailyStudyGoal", Number(event.target.value))}>
                {[30, 45, 60, 90, 120, 150, 180, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
              </select>
            </label>
          </article>

          <article className="accountPanel settingsPanel">
            <div className="accountPanelHeading">
              <div><h2>Planner defaults</h2><p>These preferences are used when you add a new study session.</p></div>
              <span className="panelHeadingIcon">▦</span>
            </div>
            <label className="settingRow" htmlFor="default-subject">
              <span><strong>Default subject</strong><small>Preselect this subject in the Study Planner.</small></span>
              <select id="default-subject" value={settings.defaultSubject} onChange={(event) => updateSetting("defaultSubject", event.target.value)}>
                <option>DBMS</option>
                <option>Operating Systems</option>
                <option>Java</option>
                <option>Mathematics</option>
                <option>Other</option>
              </select>
            </label>
            <label className="settingRow" htmlFor="default-length">
              <span><strong>Default session length</strong><small>Starting duration for a new planner session.</small></span>
              <select id="default-length" value={settings.defaultSessionLength} onChange={(event) => updateSetting("defaultSessionLength", Number(event.target.value))}>
                <option value="25">25 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </label>
          </article>

          <div className="settingsPrivacyNote">
            <span>🔒</span>
            <p>Study preferences are saved in this browser. They are not shared with other devices.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Settings;
