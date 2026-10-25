import { useEffect, useState } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
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
      <div className="sg-sidebar-label">Workspace</div>
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
          <span>Personal workspace</span>
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

export function CurrentSettings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch {
      // Keep the preview usable if browser storage is unavailable.
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(true);
  };

  return (
    <div className="sg-settings sg-current">
      <div className="sg-shell">
        <Sidebar />
        <main className="sg-main">
          <header className="sg-topbar">
            <div className="sg-crumb"><span>Workspace</span><ChevronRight size={13} /><strong>Settings</strong></div>
            <div className="sg-top-actions">
              <span className="sg-top-note">Your study space, your pace</span>
              <div className="sg-avatar sg-top-avatar" aria-label="Alex Morgan">AM</div>
            </div>
          </header>
          <div className="sg-content">
            <div className="sg-heading-row">
              <div>
                <span className="sg-eyebrow"><span className="sg-eyebrow-dot" />Make StudyGenie yours</span>
                <h1>Settings</h1>
                <p>Set your study goals and choose the defaults that work for you.</p>
              </div>
              <div className={`sg-saved${saved ? " is-updated" : ""}`} role="status">
                {saved && <CircleCheck size={13} />}
                Saved on this device
              </div>
            </div>

            <section className="sg-panel" aria-labelledby="current-goals">
              <div className="sg-panel-heading">
                <div>
                  <h2 id="current-goals">Study goals</h2>
                  <p>Choose a daily target to keep your progress on track.</p>
                </div>
                <span className="sg-panel-icon"><Target size={17} /></span>
              </div>
              <label className="sg-setting-row" htmlFor="current-daily-goal">
                <span className="sg-setting-copy">
                  <strong>Daily study goal</strong>
                  <small>Minutes you plan to study each day. Used on your Progress Tracking page.</small>
                </span>
                <SelectField id="current-daily-goal" value={settings.dailyStudyGoal} onChange={(event) => updateSetting("dailyStudyGoal", Number(event.target.value))}>
                  {[30, 45, 60, 90, 120, 150, 180, 240].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                </SelectField>
              </label>
            </section>

            <section className="sg-panel" aria-labelledby="current-planner">
              <div className="sg-panel-heading">
                <div>
                  <h2 id="current-planner">Planner defaults</h2>
                  <p>These preferences are used when you add a new study session.</p>
                </div>
                <span className="sg-panel-icon"><CalendarDays size={17} /></span>
              </div>
              <label className="sg-setting-row" htmlFor="current-subject">
                <span className="sg-setting-copy">
                  <strong>Default subject</strong>
                  <small>Preselect this subject in the Study Planner.</small>
                </span>
                <SelectField id="current-subject" value={settings.defaultSubject} onChange={(event) => updateSetting("defaultSubject", event.target.value)}>
                  {["DBMS", "Operating Systems", "Java", "Mathematics", "Other"].map((subject) => <option key={subject}>{subject}</option>)}
                </SelectField>
              </label>
              <label className="sg-setting-row" htmlFor="current-session-length">
                <span className="sg-setting-copy">
                  <strong>Default session length</strong>
                  <small>Starting duration for a new planner session.</small>
                </span>
                <SelectField id="current-session-length" value={settings.defaultSessionLength} onChange={(event) => updateSetting("defaultSessionLength", Number(event.target.value))}>
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
              <p>Study preferences are saved in this browser. They are not shared with other devices.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CurrentSettings;
