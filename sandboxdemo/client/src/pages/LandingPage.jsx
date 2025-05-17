import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  console.log("Landing Page Loaded");

  return (
    <div className="landing-page">
      {/* Header Navigation */}
      <header className="header">
        <div className="logo">NoteFlow</div>
        <nav className="nav">
          <Link to="/login" state={{ fromLanding: true }} className="nav-link">
            Login
          </Link>
          <Link to="/register" className="button primary-button">
            Create Account
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Take Smarter Notes with AI Assistance</h1>
          <p>
            Organize your thoughts, collaborate in real-time, and enhance your
            productivity with our advanced note-taking application.
          </p>
          <div className="cta-buttons">
            <Link to="/register" state={{ fromLanding: true }} className="button primary-button">
              Get Started - It's Free
            </Link>
            <a href="#features" className="button secondary-button">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://placehold.co/600x400/e9f1ff/3f51b5?text=NoteFlow"
            alt="Note-taking application screenshot"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <h2>Powerful Features for Your Ideas</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Rich Text Editing</h3>
            <p>
              Format your notes with a powerful yet intuitive editor that
              handles text, images, code, and more.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>
              Get real-time suggestions for grammar, style, and content
              organization as you write.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Smart Search</h3>
            <p>
              Find exactly what you need with our powerful semantic search that
              understands context.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Real-time Collaboration</h3>
            <p>
              Work together with teammates seeing changes instantly as they
              happen.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          {/* Testimonial cards would go here */}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">NoteFlow</div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Templates</a>
            </div>
            <div className="link-group">
              <h4>Resources</h4>
              <a href="#">Blog</a>
              <a href="#">Help Center</a>
              <a href="#">Tutorials</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Careers</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 NoteFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
