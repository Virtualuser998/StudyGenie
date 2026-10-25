function StatCard({
  icon,
  title,
  value,
  subtitle
}) {

  return (
    <div className="dashboardStatCard">

      <div className="statCircle">
        {icon}
      </div>

      <div>

        <p className="statTitle">
          {title}
        </p>

        <h2>
          {value}
        </h2>

        <span>
          {subtitle}
        </span>

      </div>

    </div>
  );
}

export default StatCard;