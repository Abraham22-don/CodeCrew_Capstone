function About() {
  return (
    <section className="page">
      <p style={{ color: "#c084fc", fontWeight: "bold" }}>
        MEET THE TEAM
      </p>

      <h1>About CodeCrew</h1>

      <p className="subtitle">
        Three team members working together to build something useful.
      </p>

      <div className="card">
        <h2>Our Team</h2>

        <ul className="team-list">
          <li>Abraham Salazar</li>
          <li>Jordan Lopez</li>
          <li>Damion Govea</li>
          <li>Luke Glasnapp</li>
        </ul>

        <p>
          We are building the Student Productivity Hub to help
          college students organize assignments, manage deadlines,
          and track their academic progress.
        </p>
      </div>

      <div className="card">
        <h2 style={{ color: "#34d399" }}>Our Goal</h2>

        <p>
          Create a simple, organized, and easy-to-use application
          that makes managing college work easier.
        </p>
      </div>
    </section>
  );
}

export default About;