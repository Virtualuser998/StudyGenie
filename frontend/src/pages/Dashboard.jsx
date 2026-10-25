import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

function Dashboard() {

  return (
    <div className="dashboardLayout">

      <Sidebar />

      <main className="dashboardMain">

        <Topbar />

        {/* TOP CARDS */}

        <section className="dashboardStats">

          <StatCard
            icon="📚"
            title="Study Materials"
            value="24"
            subtitle="+4 this week"
          />

          <StatCard
            icon="📝"
            title="Notes Generated"
            value="18"
            subtitle="+3 this week"
          />

          <StatCard
            icon="🤖"
            title="Doubts Solved"
            value="36"
            subtitle="+8 this week"
          />

          <StatCard
            icon="🏆"
            title="Quiz Score"
            value="85%"
            subtitle="+12% improvement"
          />

        </section>


        {/* MIDDLE SECTION */}

        <section className="dashboardMiddle">

          {/* LEARNING PROGRESS */}

          <div className="dashboardCard learningCard">

            <div className="dashboardCardHeader">

              <h2>
                📈 Learning Progress
              </h2>

              <select>
                <option>
                  This Week
                </option>

                <option>
                  This Month
                </option>
              </select>

            </div>

            <div className="progressChart">

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "35%"
                  }}
                ></div>
                <span>Mon</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "45%"
                  }}
                ></div>
                <span>Tue</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "55%"
                  }}
                ></div>
                <span>Wed</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "65%"
                  }}
                ></div>
                <span>Thu</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "75%"
                  }}
                ></div>
                <span>Fri</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "85%"
                  }}
                ></div>
                <span>Sat</span>
              </div>

              <div className="barItem">
                <div
                  className="bar"
                  style={{
                    height: "95%"
                  }}
                ></div>
                <span>Sun</span>
              </div>

            </div>

            <div className="learningStats">

              <div>
                <span>⏱️</span>
                <h3>12h 30m</h3>
                <p>Study Time</p>
              </div>

              <div>
                <span>📖</span>
                <h3>16</h3>
                <p>Topics Covered</p>
              </div>

              <div>
                <span>✅</span>
                <h3>28</h3>
                <p>Tasks Done</p>
              </div>

              <div>
                <span>🎯</span>
                <h3>85%</h3>
                <p>Accuracy</p>
              </div>

            </div>

          </div>


          {/* TODAY SCHEDULE */}

          <div className="dashboardCard">

            <div className="dashboardCardHeader">

              <h2>
                📅 Today's Schedule
              </h2>

              <a href="/planner">
                View Planner
              </a>

            </div>

            <ScheduleItem
              time="09:00 AM"
              end="10:30 AM"
              subject="Data Structures"
              topic="Arrays and Linked Lists"
              type="Study"
            />

            <ScheduleItem
              time="11:00 AM"
              end="12:00 PM"
              subject="DBMS"
              topic="SQL Joins & Normalization"
              type="Study"
            />

            <ScheduleItem
              time="02:00 PM"
              end="03:00 PM"
              subject="Operating Systems"
              topic="Process Scheduling"
              type="Study"
            />

            <ScheduleItem
              time="04:00 PM"
              end="05:00 PM"
              subject="Quiz Practice"
              topic="DBMS Chapter 3"
              type="Quiz"
            />

          </div>

        </section>


        {/* BOTTOM SECTION */}

        <section className="dashboardBottom">

          {/* RECENT ACTIVITY */}

          <div className="dashboardCard">

            <div className="dashboardCardHeader">

              <h2>
                ⚡ Recent Activity
              </h2>

              <a href="#">
                View All
              </a>

            </div>

            <ActivityItem
              icon="📝"
              text="AI Notes generated for Linked List"
              time="Today, 10:30 AM"
            />

            <ActivityItem
              icon="🤖"
              text="Doubt solved: What is Normalization?"
              time="Today, 09:15 AM"
            />

            <ActivityItem
              icon="🏆"
              text="Completed DBMS Chapter 2 Quiz"
              time="Yesterday, 06:20 PM"
            />

            <ActivityItem
              icon="📁"
              text="Uploaded Operating Systems Notes.pdf"
              time="Yesterday, 04:45 PM"
            />

          </div>


          {/* QUIZ PERFORMANCE */}

          <div className="dashboardCard">

            <div className="dashboardCardHeader">

              <h2>
                🏆 Quiz Performance
              </h2>

              <a href="/quiz">
                View All
              </a>

            </div>

            <div className="quizDashboardContent">

              <div className="quizCircle">

                <div>

                  <h1>
                    85%
                  </h1>

                  <p>
                    Overall Score
                  </p>

                </div>

              </div>

              <div className="quizDetails">

                <p>
                  <span>
                    🟢 Correct Answers
                  </span>

                  <strong>
                    68
                  </strong>
                </p>

                <p>
                  <span>
                    🔴 Incorrect Answers
                  </span>

                  <strong>
                    12
                  </strong>
                </p>

                <p>
                  <span>
                    🔵 Total Quizzes
                  </span>

                  <strong>
                    8
                  </strong>
                </p>

                <p>
                  <span>
                    🟣 Average Score
                  </span>

                  <strong>
                    85%
                  </strong>
                </p>

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}


function ScheduleItem({
  time,
  end,
  subject,
  topic,
  type
}) {

  return (
    <div className="scheduleRow">

      <div className="scheduleTime">

        <strong>
          {time}
        </strong>

        <span>
          {end}
        </span>

      </div>

      <div className="scheduleInfo">

        <h4>
          {subject}
        </h4>

        <p>
          {topic}
        </p>

      </div>

      <span className="scheduleType">
        {type}
      </span>

    </div>
  );
}


function ActivityItem({
  icon,
  text,
  time
}) {

  return (
    <div className="activityRow">

      <div className="activityIcon">
        {icon}
      </div>

      <div className="activityText">

        <p>
          {text}
        </p>

        <span>
          {time}
        </span>

      </div>

    </div>
  );
}

export default Dashboard;