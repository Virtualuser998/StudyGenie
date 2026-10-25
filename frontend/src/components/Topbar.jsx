function readCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

function Topbar() {
  const user = readCurrentUser();
  return (
    <header className="dashboardTopbar">
      <div className="welcomeText">
        <h1>Welcome back, {user?.name || "Student"}</h1>
        <p>Keep learning at your own pace.</p>
      </div>
      <div className="topbarActions" aria-label="Signed-in account">
        <div className="topbarAvatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
        </div>
      </div>
    </header>
  );
}

export default Topbar;