import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import RegisterForm from "../components/auth/RegisterForm";
import Spline from "@splinetool/react-spline";

const RegisterPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  // All state declarations at the top level
  const [isSplineLoaded, setIsSplineLoaded] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [cardHovered, setCardHovered] = useState(false);
  const [infoCardHovered, setInfoCardHovered] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const [linkHovered, setLinkHovered] = useState(false);
  const [hintHovered, setHintHovered] = useState(false);

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
      top: "-80px",
      right: "-80px",
      width: "200px",
      height: "200px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(52, 152, 219, 0.15), rgba(41, 128, 185, 0.25))",
      zIndex: -1,
    },
    cardDecorationSecond: {
      position: "absolute",
      bottom: "-50px",
      left: "-50px",
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(46, 204, 113, 0.15), rgba(52, 152, 219, 0.15))",
      zIndex: -1,
    },
    cardDecorationThird: {
      position: "absolute",
      top: "40%",
      left: "-30px",
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(155, 89, 182, 0.1))",
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
      borderRadius: "20px",
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
      position: "relative",
      overflow: "hidden",
    },
    infoCardHover: {
      transform: "translateY(-5px)",
      boxShadow: "0 15px 35px rgba(52, 152, 219, 0.18)",
    },
    infoCardDecoration: {
      position: "absolute",
      top: "-30px",
      right: "-30px",
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      background:
        "linear-gradient(135deg, rgba(52, 152, 219, 0.1), rgba(41, 128, 185, 0.15))",
      zIndex: -1,
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
      transition: "transform 0.3s ease, color 0.3s ease",
      cursor: "pointer",
    }),
    icon: (isHovered) => ({
      marginRight: "0.75rem",
      fontSize: "1.25rem",
      color: isHovered ? "#3498db" : "#3498db",
      transform: isHovered
        ? "scale(1.2) rotate(5deg)"
        : "scale(1) rotate(0deg)",
      transition: "transform 0.3s ease, color 0.3s ease",
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
      padding: "10px 18px",
      background: "rgba(255, 255, 255, 0.8)",
      borderRadius: "10px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      border: "1px solid rgba(52, 152, 219, 0.1)",
      transition: "transform 0.3s ease, opacity 0.3s ease",
    },
    hintHover: {
      transform: "translateX(-50%) translateY(-3px)",
      boxShadow: "0 7px 14px rgba(0, 0, 0, 0.1)",
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
        {/* Registration Card */}
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
          <div style={styles.cardDecorationThird}></div>

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
          <h2 style={styles.heading}>Create Your Account</h2>
          <p style={styles.description}>
            Join thousands of users organizing their thoughts better
          </p>

          <RegisterForm />

          <div style={styles.footerText}>
            Already have an account?
            <div style={{ position: "relative" }}>
              <Link
                to="/login"
                style={{
                  ...styles.link,
                  ...(linkHovered ? styles.linkHover : {}),
                }}
                onMouseEnter={() => setLinkHovered(true)}
                onMouseLeave={() => setLinkHovered(false)}
              >
                Login
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

        {/* Why Join Section */}
        <div
          style={{
            ...styles.infoCard,
            ...(infoCardHovered ? styles.infoCardHover : {}),
          }}
          onMouseEnter={() => setInfoCardHovered(true)}
          onMouseLeave={() => setInfoCardHovered(false)}
        >
          {/* Decorative Element */}
          <div style={styles.infoCardDecoration}></div>

          <h3 style={styles.infoTitle}>
            Why join NoteFlow?
            <div style={styles.infoTitleAfter}></div>
          </h3>
          <ul style={styles.ul}>
            {[
              { icon: "✨", text: "Intelligent note organization" },
              { icon: "🤖", text: "AI-powered writing assistance" },
              { icon: "👥", text: "Seamless collaboration" },
              { icon: "📱", text: "Cross-platform availability" },
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

      {/* Interaction hint */}
      <div
        style={{
          ...styles.hint,
          ...(hintHovered ? styles.hintHover : {}),
        }}
        onMouseEnter={() => setHintHovered(true)}
        onMouseLeave={() => setHintHovered(false)}
      >
        Try interacting with the 3D objects!
      </div>

      {/* Add keyframe animation for the spinner and style form elements */}
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
            background-color: rgba(255, 255, 255, 0.95);
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
            margin-top: 10px;
          }
          
          button[type="submit"]:hover {
            transform: translateY(-3px);
            box-shadow: 0 7px 14px rgba(52, 152, 219, 0.3);
          }
          
          button[type="submit"]:active {
            transform: translateY(1px);
            box-shadow: 0 2px 3px rgba(52, 152, 219, 0.2);
          }
          
          .form-error {
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: -10px;
            margin-bottom: 15px;
            padding-left: 3px;
          }
        `}
      </style>
    </div>
  );
};

export default RegisterPage;