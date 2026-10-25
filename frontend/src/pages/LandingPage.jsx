import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

function LandingPage() {
  return (
    <div>

      <Navbar />

      {/* HERO SECTION */}

      <section className="hero">

        <div className="heroContent">

          <div className="badge">
            ✨ AI POWERED STUDY ASSISTANT
          </div>

          <h1>
            Your Personal
            <span> Study Assistant </span>
            Powered by AI
          </h1>

          <p>
            Upload your study materials, ask doubts,
            generate AI notes, take quizzes and track
            your learning progress — all in one place.
          </p>

          <div className="heroButtons">

            <Link
              to="/register"
              className="heroPrimary"
            >
              🚀 Get Started Free
            </Link>

            <a
              href="#features"
              className="heroSecondary"
            >
              Learn More
            </a>

          </div>

        </div>

        <div className="heroImage">

          <div className="robotBackground">

            <img
              src="/robot.png"
              alt="StudyGenie AI Assistant"
            />

          </div>

        </div>

      </section>


      {/* FEATURES */}

      <section
        className="features"
        id="features"
      >

        <h2>
          Powerful Features to
          <span> Boost Your Learning</span>
        </h2>

        <p>
          Everything you need to study smarter,
          not harder.
        </p>

        <div className="featureGrid">

          <FeatureCard
            icon="📁"
            title="Study Materials"
            text="Upload PDF, DOCX and study materials."
          />

          <FeatureCard
            icon="📝"
            title="AI Notes"
            text="Generate summaries and important key points."
          />

          <FeatureCard
            icon="🤖"
            title="AI Doubt Solver"
            text="Ask academic questions and receive explanations."
          />

          <FeatureCard
            icon="❓"
            title="Quiz Generator"
            text="Generate MCQs and test your knowledge."
          />

          <FeatureCard
            icon="📅"
            title="Study Planner"
            text="Plan your daily and weekly study schedule."
          />

          <FeatureCard
            icon="📊"
            title="Progress Tracking"
            text="Monitor quiz scores and study progress."
          />

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section
        className="howSection"
        id="how"
      >

        <h2>
          How <span>StudyGenie</span> Works
        </h2>

        <div className="steps">

          <Step
            number="01"
            title="Upload"
            text="Upload your study materials."
          />

          <Step
            number="02"
            title="AI Processes"
            text="StudyGenie analyzes the content."
          />

          <Step
            number="03"
            title="Learn"
            text="Generate notes, quizzes and answers."
          />

          <Step
            number="04"
            title="Improve"
            text="Track your learning progress."
          />

        </div>

      </section>


      {/* CTA */}

      <section className="cta">

        <div>

          <h2>
            Ready to Study Smarter?
          </h2>

          <p>
            Start your AI powered learning journey today.
          </p>

        </div>

        <Link
          to="/register"
          className="ctaButton"
        >
          Get Started Free →
        </Link>

      </section>


      <footer>

        <h2>
          🎓 Study<span>Genie</span>
        </h2>

        <p>
          AI-Based Personal Study Assistant System
        </p>

        <p>
          © 2026 StudyGenie
        </p>

      </footer>

    </div>
  );
}



function FeatureCard({ icon, title, text }) {
  return (
    <div className="featureCard">

      <div className="featureIcon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

    </div>
  );
}


function Step({ number, title, text }) {
  return (
    <div className="stepCard">

      <span>
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </div>
  );
}

export default LandingPage;