import { Routes, Route } from "react-router-dom";
import DoubtSolver from "./pages/DoubtSolver";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import StudyMaterials from "./pages/StudyMaterials";
import AINotes from "./pages/AINotes";
import QuizAssessment from "./pages/QuizAssessment";
import StudyPlanner from "./pages/StudyPlanner";
import ProgressTracking from "./pages/ProgressTracking";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
function App() {
  return (
    <Routes>

      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<Register />} />

      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/materials" element={<StudyMaterials />} />   
      <Route path="/notes" element={<AINotes />} />

      <Route path="/doubt-solver" element={<DoubtSolver />}/>
      <Route path="/quiz" element={<QuizAssessment />} />
      <Route path="/planner" element={<StudyPlanner />} />
      <Route path="/progress" element={<ProgressTracking />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      
      </Routes>
      
);
}

export default App;