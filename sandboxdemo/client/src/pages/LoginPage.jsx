import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import LoginForm from "../components/auth/LoginForm";
import Spline from "@splinetool/react-spline";

const LoginPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  // Stick with only these 4 state hooks as in your original code
  const [cardHovered, setCardHovered] = useState(false);
  const [infoCardHovered, setInfoCardHovered] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, loading, navigate]);

  const handleSplineLoad = () => {
    setIsSplineLoaded(true);
  };

  if (loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
          backgroundColor: "#ffffff",
          color: "#3498db",
        }}
      >
        <div className="loading-spinner"></div>
        Loading...
      </div>
    );
  }

  const styles = {
    page: {
      position: "relative",
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#2c3e50",
      background: "linear-gradient(120deg, #f8f9fa, #e9f0f8)",
    },
    splineBg: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 0,
      opacity: isSplineLoaded ? 1 : 0,
      transition: "opacity 1s ease-in-out",
    },
    container: {
      display: "flex",
      flexDirection: "row",
      gap: "3rem",
      alignItems: "stretch",
      justifyContent: "center",
      padding: "2rem",
      width: "100%",
      maxWidth: "1200px",
      position: "relative",
      zIndex: 1,
    },
    card: {
      background:
        "linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.8))",
      backdropFilter: "blur(10px)",
      borderRadius: "20px",
      padding: "3rem",
      flex: 1,
      minWidth: "350px",
      maxWidth: "450px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      boxShadow:
        "0 15px 35px rgba(52, 152, 219, 0.12), 0 5px 15px rgba(0, 0, 0, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.7)",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      transform: "translateY(0)",
      position: "relative",
      overflow: "hidden",
    },
    cardHover: {
      transform: "translateY(-8px)",
      boxShadow:
        "0 20px 40px rgba(52, 152, 219, 0.18), 0 10px 20px rgba(0, 0, 0, 0.1)",
    },
    cardDecoration: {
      position: "absolute",
      top: "-50px",
      right: "-50px",
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.3))",
      zIndex: -1,
    },
    cardDecorationSecond: {
      position: "absolute",
      bottom: "-60px",
      left: "-60px",
      width: "180px",
      height: "180px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(41, 128, 185, 0.2))",
      zIndex: -1,
    },
    logoWrapper: {
      textAlign: "center",
      marginBottom: "1.5rem",
      position: "relative",
      display: "inline-block",
      width: "100%",
    },
    logo: {
      fontSize: "2.5rem",
      fontWeight: "bold",
      marginBottom: "0.75rem",
      textDecoration: "none",
      textAlign: "center",
      background: "linear-gradient(135deg, #3498db, #2980b9)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      transition: "transform 0.3s ease",
      display: "inline-block",
      textShadow: "0 10px 20px rgba(52, 152, 219, 0.15)",
    },
    logoHover: {
      transform: "scale(1.05) translateY(-3px)",
      textShadow: "0 15px 30px rgba(52, 152, 219, 0.25)",
    },
    logoUnderline: {
      width: "60px",
      height: "3px",
      background: "linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.2))",
      margin: "0 auto",
      borderRadius: "2px",
      marginTop: "6px",
      transition: "width 0.3s ease",
    },
    logoUnderlineHover: {
      width: "100px",
    },
    heading: {
      fontSize: "2rem",
      textAlign: "center",
      marginBottom: "0.75rem",
      color: "#2c3e50",
      fontWeight: "600",
      letterSpacing: "0.5px",
    },
    description: {
      fontSize: "1.1rem",
      textAlign: "center",
      color: "#7f8c8d",
      marginBottom: "2.5rem",
      lineHeight: "1.6",
    },
    footerText: {
      marginTop: "2rem",
      textAlign: "center",
      fontSize: "1rem",
      color: "#7f8c8d",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "8px",
    },
    link: {
      color: "#3498db",
      marginLeft: "5px",
      textDecoration: "none",
      fontWeight: "600",
      transition: "all 0.2s ease",
      position: "relative",
      padding: "2px 5px",
    },
    linkHover: {
      color: "#2980b9",
    },
    linkUnderline: {
      position: "absolute",
      bottom: "0",
      left: "0",
      width: "0%",
      height: "2px",
      background: "linear-gradient(to right, #3498db, #2980b9)",
      transition: "width 0.3s ease",
      borderRadius: "2px",
    },
    linkUnderlineHover: {
      width: "100%",
    },
    infoCard: {
      background: "rgba(255, 255, 255, 0.75)",
      borderRadius: "16px",
      padding: "2.5rem",
      flex: 1,
      minWidth: "300px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      color: "#2c3e50",
      boxShadow: "0 10px 30px rgba(52, 152, 219, 0.12)",
      border: "1px solid rgba(52, 152, 219, 0.08)",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      transform: "translateY(0)",
    },
    infoCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 35px rgba(52, 152, 219, 0.18)",
    },
    infoTitle: {
      fontSize: "1.8rem",
      marginBottom: "2rem",
      textAlign: "center",
      color: "#2c3e50",
      fontWeight: "600",
      position: "relative",
    },
    infoTitleAfter: {
      content: "''",
      position: "absolute",
      bottom: "-0.75rem",
      left: "calc(50% - 25px)",
      width: "50px",
      height: "3px",
      borderRadius: "1.5px",
      background: "linear-gradient(to right, #3498db, rgba(52, 152, 219, 0.3))",
    },
    ul: {
      listStyle: "none",
      padding: 0,
      margin: "0 auto",
      width: "85%",
    },
    li: (isHovered) => ({
      fontSize: "1.1rem",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      fontWeight: "500",
      color: isHovered ? "#3498db" : "#34495e",
      transform: isHovered ? "translateX(5px)" : "translateX(0)",
      transition: "transform 0.2s ease, color 0.2s ease",
      cursor: "pointer",
    }),
    icon: (isHovered) => ({
      marginRight: "0.75rem",
      fontSize: "1.25rem",
      color: isHovered ? "#3498db" : "#3498db",
      transform: isHovered ? "scale(1.2)" : "scale(1)",
      transition: "transform 0.2s ease, color 0.2s ease",
    }),
    loader: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#ffffff",
      zIndex: isSplineLoaded ? -1 : 10,
      opacity: isSplineLoaded ? 0 : 1,
      transition: "opacity 0.5s ease, z-index 0.5s step-end",
      color: "#3498db",
      fontSize: "1.5rem",
    },
    hint: {
      position: "absolute",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      color: "#7f8c8d",
      fontSize: "0.9rem",
      textAlign: "center",
      zIndex: 5,
      padding: "8px 15px",
      background: "rgba(255, 255, 255, 0.7)",
      borderRadius: "8px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "transform 0.3s ease", // Added for non-state hover effect
    },
    loadingSpinner: {
      display: "inline-block",
      width: "25px",
      height: "25px",
      border: "3px solid rgba(52, 152, 219, 0.2)",
      borderRadius: "50%",
      borderTop: "3px solid #3498db",
      animation: "spin 1s linear infinite",
      marginRight: "10px",
    },
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  return (
    <div style={styles.page}>
      {/* Loading screen */}
      {!isSplineLoaded && (
        <div style={styles.loader}>
          <div style={styles.loadingSpinner}></div>
          Loading 3D Environment...
        </div>
      )}
      {/* 3D Background */}
      <div style={styles.splineBg}>
        <Spline
          scene="https://prod.spline.design/ZcK9ODDU8c1-G9YT/scene.splinecode"
          onLoad={handleSplineLoad}
        />
      </div>

      {/* Content Layer */}
      <div style={styles.container}>
        {/* Login Card */}
        <div
          style={{
            ...styles.card,
            ...(cardHovered ? styles.cardHover : {}),
          }}
          onMouseEnter={() => setCardHovered(true)}
          onMouseLeave={() => setCardHovered(false)}
        >
          {/* Decorative Elements */}
          <div style={styles.cardDecoration}></div>
          <div style={styles.cardDecorationSecond}></div>

          <div style={styles.logoWrapper}>
            <Link
              to="/"
              style={{
                ...styles.logo,
                ...(logoHovered ? styles.logoHover : {}),
              }}
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              NoteFlow
            </Link>
            <div
              style={{
                ...styles.logoUnderline,
                ...(logoHovered ? styles.logoUnderlineHover : {}),
              }}
            ></div>
          </div>
          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.description}>
            Log in to access your notes and continue your work
          </p>

          <LoginForm />

          <div style={styles.footerText}>
            Don't have an account?
            <div style={{ position: "relative" }}>
              <Link
                to="/register"
                style={{
                  ...styles.link,
                  ...(linkHovered ? styles.linkHover : {}),
                }}
                onMouseEnter={() => setLinkHovered(true)}
                onMouseLeave={() => setLinkHovered(false)}
              >
                Create Account
                <div
                  style={{
                    ...styles.linkUnderline,
                    ...(linkHovered ? styles.linkUnderlineHover : {}),
                  }}
                ></div>
              </Link>
            </div>
          </div>
        </div>

        {/* What's New Section */}
        <div
          style={{
            ...styles.infoCard,
            ...(infoCardHovered ? styles.infoCardHover : {}),
          }}
          onMouseEnter={() => setInfoCardHovered(true)}
          onMouseLeave={() => setInfoCardHovered(false)}
        >
          <h3 style={styles.infoTitle}>
            What's New
            <div style={styles.infoTitleAfter}></div>
          </h3>
          <ul style={styles.ul}>
            {[
              { icon: "✨", text: "AI-powered writing suggestions" },
              { icon: "📋", text: "Smart templates & folders" },
              { icon: "🔍", text: "Fast & precise note search" },
            ].map((feature, index) => (
              <li
                key={index}
                style={styles.li(hoveredFeature === index)}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <span style={styles.icon(hoveredFeature === index)}>
                  {feature.icon}
                </span>
                {feature.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* Interaction hint - using CSS hover instead of React state */}
      <div
        style={styles.hint}
        className="hint-element" // Add a class for CSS hover
      >
        Try interacting with the 3D objects!
      </div>
      {/* Add keyframe animation for the spinner and CSS hover for hint */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .loading-spinner {
            display: inline-block;
            width: 25px;
            height: 25px;
            border: 3px solid rgba(52, 152, 219, 0.2);
            border-radius: 50%;
            border-top: 3px solid #3498db;
            animation: spin 1s linear infinite;
            margin-right: 10px;
          }
          
          /* CSS hover instead of React state for hint */
          .hint-element:hover {
            transform: translateX(-50%) translateY(-3px);
            box-shadow: 0 7px 14px rgba(0, 0, 0, 0.1);
          }
          
          /* Form element styling */
          input {
            width: 100%;
            padding: 12px 16px;
            margin-bottom: 15px;
            border: 1px solid rgba(52, 152, 219, 0.3);
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s ease;
            background-color: rgba(255, 255, 255, 0.8);
          }
          
          input:focus {
            border-color: #3498db;
            box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
            outline: none;
          }
          
          button[type="submit"] {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
          }
          
          button[type="submit"]:hover {
            transform: translateY(-3px);
            box-shadow: 0 7px 14px rgba(52, 152, 219, 0.3);
          }
          
          button[type="submit"]:active {
            transform: translateY(-1px);
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;