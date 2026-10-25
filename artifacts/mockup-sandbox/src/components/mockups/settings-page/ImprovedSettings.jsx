import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  House,
  LockKeyhole,
  Settings2,
  Sparkles,
  Target,
} from "lucide-react";
import "./_settings.css";

const defaults = {
  dailyStudyGoal: 90,
  defaultSessionLength: 45,
  defaultSubject: "DBMS",
};

const settingsKey = "studygenie-study-settings";

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(settingsKey) || "{}");
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function Brand() {
  return (
    <div className="sg-brand">
      <span className="sg-brand-mark"><Sparkles size={16} strokeWidth={2.4} /></span>
      <span>StudyGenie</span>
    </div>
  );
}

function Sidebar() {
  const items = [
    { label: "Overview", icon: House },
    { label: "My materials", icon: BookOpen },
    { label: "AI study kits", icon: Brain },
    { label: "Study planner", icon: CalendarDays },
    { label: "Progress tracking", icon: Target },
    { label: "Settings", icon: Settings2, active: true },
  ];

  return (
    <aside className="sg-sidebar">
      <Brand />
      <div className="sg-sidebar-label">Your learning space</div>
      <nav className="sg-nav-list" aria-label="Main navigation">
        {items.map(({ label, icon: Icon, active }) => (
          <div className={`sg-nav-item${active ? " active" : ""}`} key={label} aria-current={active ? "page" : undefined}>
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </nav>
      <div className="sg-sidebar-bottom">
        <div className="sg-avatar" aria-hidden="true">AM</div>
        <div className="sg-user-copy">
          <strong>Alex Morgan</strong>
          <span>Learning, one day at a time</span>
        </div>
      </div>
    </aside>
  );
}

function SelectField({ id, value, onChange, children }) {
  return (
    <div className="sg-select-wrap">
      <select className="sg-select" id={id} value={value} onChange={onChange}>
        {children}
      </select>
      <ChevronDown className="sg-select-arrow" size={14} />
    </div>
  );
}

export function ImprovedSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch {
      // Keep the preview usable if browser storage is unavailable.
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setUpdated(true);
  };

  return (
    <div className="sg-settings sg-improved">
      <div className="sg-shell">
        <Sidebar />
        <main className="sg-main">
          <header className="sg-topbar">
            <div className="sg-crumb"><span>Your space</span><ChevronRight size={13} /><strong>Settings</strong></div>
            <div className="sg-top-actions">
              <span className="sg-top-note">A little structure, a lot more focus</span>
              <div className="sg-avatar sg-top-avatar" aria-label="Alex Morgan">AM</div>
            </div>
          </header>
          <div className="sg-content">
            <div className="sg-heading-row">
              <div>
                <span className="sg-eyebrow"><span className="sg-eyebrow-dot" />Your study rhythm</span>
                <h1>Make it yours.</h1>
                <p>Small defaults, chosen by you. Ready whenever you sit down to study.</p>
              </div>
              <div className={`sg-saved${updated ? " is-updated" : ""}`} role="status">
                {updated ? <Check size={13} /> : <CircleCheck size={13} />}
                {updated ? "Preferences updated" : "Saved on this device"}
              </div>
            </div>

            <section className="sg-rhythm-banner" aria-label="Your current study goal">
              <div className="sg-rhythm-copy">
                <span>Your daily intention</span>
                <strong>{settings.dailyStudyGoal} minutes, at your own pace</strong>
                <p>Your goal appears on Progress Tracking, so you can notice the effort adding up.</p>
              </div>
              <div className="sg-rhythm-badge">
                <div className="sg-rhythm-mark"><Target size={16} /></div>
                <div>
                  <strong>{settings.dailyStudyGoal}</strong>
                  <span>minutes each day</span>
                </div>
              </div>
            </section>

            <section className="sg-panel" aria-labelledby="improved-goals">
              <div className="sg-panel-heading">
                <div>
                  <h2>Study goals</h2>
                  <p>Pick a daily target that feels achievable, then build from there.</p>
                </div>
                <span className="sg-panel-icon"><Target size={17} /></span>
              </div>
              <label className="sg-setting-row" htmlFor="improved-daily-goal">
                <span className="sg-setting-copy">
                  <strong>Daily study goal</strong>
                  <small>Minutes you plan to study each day. Used on your Progress Tracking page.</small>
                </span>
                <SelectField id="improved-daily-goal" value={settings.dailyStudyGoal} onChange={(event) => updateSetting("dailyStudyGoal", Number(event.target.value))}>
                  {[30, 45, 60, 90, 120, 150, 180, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                </SelectField>
              </label>
            </section>

            <section className="sg-panel" aria-labelledby="improved-planner">
              <div className="sg-panel-heading">
                <div>
                  <h2>Planner defaults</h2>
                  <p>A familiar starting point for every new study session.</p>
                </div>
                <span className="sg-panel-icon"><CalendarDays size={17} /></span>
              </div>
              <label className="sg-setting-row" htmlFor="improved-subject">
                <span className="sg-setting-copy">
                  <strong>Default subject</strong>
                  <small>Preselect this subject in the Study Planner.</small>
                </span>
                <SelectField id="improved-subject" value={settings.defaultSubject} onChange={(event) => updateSetting("defaultSubject", event.target.value)}>
                  {["DBMS", "Operating Systems", "Java", "Mathematics", "Other"].map((subject) => <option key={subject}>{subject}</option>)}
                </SelectField>
              </label>
              <label className="sg-setting-row" htmlFor="improved-session-length">
                <span className="sg-setting-copy">
                  <strong>Default session length</strong>
                  <small>Starting duration for a new planner session.</small>
                </span>
                <SelectField id="improved-session-length" value={settings.defaultSessionLength} onChange={(event) => updateSetting("defaultSessionLength", Number(event.target.value))}>
                  <option value="25">25 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </SelectField>
              </label>
            </section>

            <div className="sg-privacy">
              <span className="sg-privacy-mark"><LockKeyhole size={14} /></span>
              <p><strong>Just for this browser.</strong> Your study preferences stay here and are not shared with other devices.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ImprovedSettings;
