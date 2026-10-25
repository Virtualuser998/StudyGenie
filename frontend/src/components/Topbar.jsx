function Topbar() {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  return (
    <header className="dashboardTopbar">

      <div className="welcomeText">

        <h1>
          Welcome back,
          {" "}
          {user?.name || "Student"} 👋
        </h1>

        <p>
          Continue your learning journey
          and achieve your study goals.
        </p>

      </div>

      <div className="topbarActions">

        <div className="dashboardSearch">

          <span>
            🔍
          </span>

          <input
            type="text"
            placeholder="Search anything..."
          />

        </div>

        <button className="notificationBtn">

          🔔

          <span>
            3
          </span>

        </button>

        <div className="topbarAvatar">
          {user?.name
            ? user.name.charAt(0).toUpperCase()
            : "S"}
        </div>

      </div>

    </header>
  );
}

export default Topbar;