import React from "react";
import { Link } from "react-router-dom";
import Spline from "@splinetool/react-spline";
import { red } from "@cloudinary/url-gen/actions/adjust";

const LandingPage = () => {
  // Define styles as JavaScript objects instead of using an internal style tag
  const styles = {
    landingPage: {
      position: "relative",
      height: "100vh",
      overflowX: "hidden",
      color: "#fff",
      fontFamily: "Arial, sans-serif",
    },
    splineBg: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: -1,
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.5rem 3rem",
      background: "rgba(0, 0, 0, 0.2)", // Reduced opacity from 0.4 to 0.2
    },
    logo: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      color: "#ffffff",
    },
    nav: {
      display: "flex",
      gap: "1rem",
    },
    navLink: {
      textDecoration: "none",
      color: "white",
      background: "rgba(255, 255, 255, 0.2)",
      padding: "0.5rem 1rem",
      borderRadius: "5px",
      transition: "background 0.3s ease",
    },
    navLinkHover: {
      background: "rgba(168, 157, 157, 0.4)",
    },
    hero: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "5rem 3rem",
      minHeight: "70vh",
      background: "rgba(0, 0, 0, 0.15)", // Reduced opacity from 0.3 to 0.15
      flexWrap: "wrap",
    },
    heroContent: {
      maxWidth: "50%",
      minWidth: "300px",
    },
    heroH1: {
      fontSize: "3rem",
      marginBottom: "1rem",
    },
    heroP: {
      fontSize: "1.2rem",
      marginBottom: "2rem",
    },
    ctaButtons: {
      display: "flex",
      gap: "1rem",
    },
    primaryButton: {
      textDecoration: "none",
      padding: "0.75rem 1.5rem",
      background: "rgba(24, 36, 104, 0.7)", // Made this semi-transparent
      color: "white",
      borderRadius: "8px",
      transition: "background 0.3s ease",
    },
    secondaryButton: {
      textDecoration: "none",
      padding: "0.75rem 1.5rem",
      background: "rgba(255, 255, 255, 0.2)",
      color: "white",
      borderRadius: "8px",
      transition: "background 0.3s ease",
    },
    buttonHover: {
      background: "rgba(44, 58, 140, 0.7)",
    },
    heroImage: {
      width: "100%",
      maxWidth: "500px",
    },
    image: {
      width: "100%",
      borderRadius: "12px",
    },
    section: {
      background: "rgba(0, 0, 0, 0.15)", // Reduced opacity from 0.4 to 0.15
      padding: "3rem",
      textAlign: "center",
    },
    featureGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "2rem",
      marginTop: "2rem",
    },
    featureCard: {
      background: "rgba(255, 255, 255, 0.1)",
      borderRadius: "10px",
      padding: "1.5rem",
      color: "#fff",
    },
    testimonialGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "2rem",
      marginTop: "2rem",
    },
    footerContent: {
      display: "flex",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "2rem",
      color: "#fff",
    },
    footerLogo: {
      fontWeight: "bold",
      fontSize: "1.5rem",
    },
    footerLinks: {
      display: "flex",
      gap: "3rem",
      flexWrap: "wrap",
    },
    linkGroup: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    linkGroupA: {
      display: "block",
      marginTop: "0.5rem",
      color: "#eee",
      textDecoration: "none",
    },
    footerBottom: {
      marginTop: "2rem",
      fontSize: "0.9rem",
      color: "#aaa",
    },
    logoBackground: {
      background: red,
    },
  };

  return (
    <div className="landing-page" style={styles.landingPage}>
      {/* Spline Background */}
      <div className="spline-bg" style={styles.splineBg}>
        <Spline scene="https://prod.spline.design/aCO2AVm214r8wpsn/scene.splinecode" />
      </div>

      {/* Header */}
      <header className="header" style={styles.header}>
        <div className="logo" style={styles.logo}>
          NoteFlow
        </div>
        <nav className="nav" style={styles.nav}>
          <Link to="/login" className="nav-link" style={styles.navLink}>
            Login
          </Link>
          <Link
            to="/register"
            className="button primary-button"
            style={styles.navLink}
          >
            Create Account
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero" style={styles.hero}>
        <div className="hero-content" style={styles.heroContent}>
          <h1 style={styles.heroH1}>Take Smarter Notes with AI Assistance</h1>
          <p style={styles.heroP}>
            Organize your thoughts, collaborate in real-time, and enhance your
            productivity with our advanced note-taking application.
          </p>
          <div className="cta-buttons" style={styles.ctaButtons}>
            <Link
              to="/register"
              className="button primary-button"
              style={styles.primaryButton}
            >
              Get Started - It's Free
            </Link>
            <a
              href="#features"
              className="button secondary-button"
              style={styles.secondaryButton}
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image" style={styles.heroImage}>
          <img
            src="https://placehold.co/600x400/e9f1ff/3f51b5?text=NoteFlow"
            alt="Note-taking app mockup"
            style={styles.image}
          />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="features" style={styles.section}>
        <h2>Powerful Features for Your Ideas</h2>
        <div className="feature-grid" style={styles.featureGrid}>
          <div className="feature-card" style={styles.featureCard}>
            <div className="feature-icon">📝</div>
            <h3>Rich Text Editing</h3>
            <p>
              Format your notes with a powerful editor for text, images, code,
              and more.
            </p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>
              Get suggestions for grammar, style, and organization as you write.
            </p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <div className="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>
              Find what you need with powerful semantic search that understands
              context.
            </p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <div className="feature-icon">👥</div>
            <h3>Real-time Collaboration</h3>
            <p>Work with teammates and see changes instantly.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials" style={styles.section}>
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid" style={styles.testimonialGrid}>
          <div className="feature-card" style={styles.featureCard}>
            <p>"NoteFlow has transformed the way I organize research."</p>
            <strong>- University Student</strong>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <p>"The AI assistant is like having a second brain."</p>
            <strong>- Productivity Coach</strong>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={styles.section}>
        <div className="footer-content" style={styles.footerContent}>
          <div className="footer-logo" style={styles.footerLogo}>
            NoteFlow
          </div>
          <div className="footer-links" style={styles.footerLinks}>
            <div className="link-group" style={styles.linkGroup}>
              <h4>Product</h4>
              <a href="#" style={styles.linkGroupA}>
                Features
              </a>
              <a href="#" style={styles.linkGroupA}>
                Pricing
              </a>
              <a href="#" style={styles.linkGroupA}>
                Templates
              </a>
            </div>
            <div className="link-group" style={styles.linkGroup}>
              <h4>Resources</h4>
              <a href="#" style={styles.linkGroupA}>
                Blog
              </a>
              <a href="#" style={styles.linkGroupA}>
                Help Center
              </a>
              <a href="#" style={styles.linkGroupA}>
                Tutorials
              </a>
            </div>
            <div className="link-group" style={styles.linkGroup}>
              <h4>Company</h4>
              <a href="#" style={styles.linkGroupA}>
                About
              </a>
              <a href="#" style={styles.linkGroupA}>
                Careers
              </a>
              <a href="#" style={styles.linkGroupA}>
                Contact
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom" style={styles.footerBottom}>
          <p>&copy; 2025 NoteFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;