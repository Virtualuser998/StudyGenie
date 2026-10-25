import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/accountPages.css";
import "../styles/settingsPage.css";

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

function getInitialSaveStatus() {
  try {
    return localStorage.getItem(SETTINGS_KEY) ? "saved" : "ready";
  } catch {
    return "error";
  }
}

function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saveStatus, setSaveStatus] = useState(getInitialSaveStatus);

  const updateSetting = (key, value) => {
    const nextSettings = { ...settings, [key]: value };
    setSettings(nextSettings);
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextSettings));
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  };

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain accountMain">
        <Topbar />
        <div className="settingsExperience">
          <section className="settingsExperienceHeader">
            <div>
              <span className="settingsEyebrow"><i aria-hidden="true" />YOUR STUDY RHYTHM</span>
              <h1>Make it yours.</h1>
              <p>Small defaults, chosen by you. Ready whenever you sit down to study.</p>
            </div>
            <div className={`settingsSaveStatus ${saveStatus}`} role="status" aria-live="polite">
              <span aria-hidden="true" />
              {saveStatus === "error" ? "Could not save on this device" : saveStatus === "ready" ? "Your default preferences are active" : "Saved on this device"}
            </div>
          </section>

          <section className="settingsDailyBanner" aria-label="Your current study goal">
            <div>
              <span className="settingsBannerEyebrow">YOUR DAILY INTENTION</span>
              <strong>{settings.dailyStudyGoal} minutes, at your own pace</strong>
              <p>Your goal appears on Progress Tracking, so you can notice the effort adding up.</p>
            </div>
            <div className="settingsGoalBadge">
              <span className="settingsGoalIcon" aria-hidden="true">◎</span>
              <span><strong>{settings.dailyStudyGoal}</strong><small>minutes each day</small></span>
            </div>
          </section>

          <section className="accountPanel settingsExperiencePanel" aria-labelledby="settings-study-goals">
            <div className="settingsExperiencePanelHeading">
              <div>
                <h2 id="settings-study-goals">Study goals</h2>
                <p>Pick a daily target that feels achievable, then build from there.</p>
              </div>
              <span className="settingsExperiencePanelIcon" aria-hidden="true">◎</span>
            </div>
            <label className="settingsExperienceRow" htmlFor="daily-goal">
              <span><strong>Daily study goal</strong><small>Minutes you plan to study each day. Used on your Progress Tracking page.</small></span>
              <select id="daily-goal" value={settings.dailyStudyGoal} onChange={(event) => updateSetting("dailyStudyGoal", Number(event.target.value))}>
                {[30, 45, 60, 90, 120, 150, 180, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
              </select>
            </label>
          </section>

          <section className="accountPanel settingsExperiencePanel" aria-labelledby="settings-planner-defaults">
            <div className="settingsExperiencePanelHeading">
              <div>
                <h2 id="settings-planner-defaults">Planner defaults</h2>
                <p>A familiar starting point for every new study session.</p>
              </div>
              <span className="settingsExperiencePanelIcon planner" aria-hidden="true">◷</span>
            </div>
            <label className="settingsExperienceRow" htmlFor="default-subject">
              <span><strong>Default subject</strong><small>Preselect this subject in the Study Planner.</small></span>
              <select id="default-subject" value={settings.defaultSubject} onChange={(event) => updateSetting("defaultSubject", event.target.value)}>
                <option>DBMS</option>
                <option>Operating Systems</option>
                <option>Java</option>
                <option>Mathematics</option>
                <option>Other</option>
              </select>
            </label>
            <label className="settingsExperienceRow" htmlFor="default-length">
              <span><strong>Default session length</strong><small>Starting duration for a new planner session.</small></span>
              <select id="default-length" value={settings.defaultSessionLength} onChange={(event) => updateSetting("defaultSessionLength", Number(event.target.value))}>
                <option value="25">25 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </label>
          </section>

          <div className="settingsExperiencePrivacy">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
                <rect x="4.5" y="10" width="15" height="10" rx="2.2" stroke="currentColor" strokeWidth="1.7" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </span>
            <p><strong>Just for this browser.</strong> Your study preferences stay here and are not shared with other devices.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Settings;
