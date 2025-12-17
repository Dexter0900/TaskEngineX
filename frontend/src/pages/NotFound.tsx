const NotFound = () => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
  }}>
    <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
    <p style={{ fontSize: "24px", color: "#666" }}>Page not found</p>
    <a
      href="/dashboard"
      style={{
        marginTop: "20px",
        padding: "10px 20px",
        backgroundColor: "#4F46E5",
        color: "white",
        textDecoration: "none",
        borderRadius: "4px",
      }}
    >
      Go to Dashboard
    </a>
  </div>
);

export default NotFound;