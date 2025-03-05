import { Link, createFileRoute } from '@tanstack/react-router';
import { 
  FaChartLine, 
  FaRobot, 
  FaShieldAlt, 
  FaSearch, 
  FaRegLightbulb, 
  FaLightbulb, 
  FaLock, 
  FaUser,
  FaBolt,
  FaMobileAlt 
} from 'react-icons/fa';
// import '../styles/presentation.css';

export const Route = createFileRoute('/presentation')({
  component: PresentationPage
});

function PresentationPage() {
  return (
    <div className="presentation-page">
      {/* Logo and Title */}
      <div className="app-header">
        <div className="logo-section">
          <span className="money-bag">💰</span>
          <span className="app-name">Financial Analyst</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="welcome-section">
          <h1>Welcome to <span className="highlight">Financial Analyst</span></h1>
          <p className="welcome-text">
            Harness the power of AI to make smarter investment decisions. 
            Our advanced algorithms analyze market trends, predict movements, 
            and provide personalized recommendations in real-time.
          </p>
        </div>

        <div className="access-cards">
          <div className="access-card">
            <FaUser className="card-icon" />
            <h2 className="header">New to Financial Analyst?</h2>
            <p>
              Join thousands of investors who trust our AI-powered platform 
              for making informed investment decisions. Get started with:
            </p>
            <ul className="feature-list">
              <li><FaRobot /> Advanced AI market analysis</li>
              <li><FaChartLine /> Real-time portfolio tracking</li>
              <li><FaSearch /> Personalized investment recommendations</li>
              <li><FaBolt /> Instant market alerts and notifications</li>
              <li><FaShieldAlt /> Risk assessment and management tools</li>
            </ul>
            <Link to="/register" className="primary-button">
              Create Free Account
            </Link>
          </div>

          <div className="access-card">
            <FaLock className="card-icon" />
            <h2 className="header">Already a Member?</h2>
            <p>
              Welcome back! Access your personalized dashboard to:
            </p>
            <ul className="feature-list">
              <li><FaChartLine /> Monitor your portfolio performance</li>
              <li><FaSearch /> View latest AI-generated insights</li>
              <li><FaLightbulb /> Get updated investment recommendations</li>
              <li><FaMobileAlt /> Access premium features</li>
            </ul>
            <Link to="/login" className="secondary-button">
              Sign In to Your Account
            </Link>
            <p className="premium-note">
              Premium features available for subscribed members
            </p>
          </div>
        </div>

        <div className="why-join">
          <h2 className="header">Why Choose Financial Analyst?</h2>
          <div className="benefits-grid">
            <div className="benefit-item">
              <FaRobot className="benefit-icon" />
              <h3>AI-Powered Analysis</h3>
              <p>Advanced algorithms analyze market patterns and trends in real-time</p>
            </div>
            <div className="benefit-item">
              <FaChartLine className="benefit-icon" />
              <h3>Predictive Analytics</h3>
              <p>Data-driven forecasts to help you make informed decisions</p>
            </div>
            <div className="benefit-item">
              <FaRegLightbulb className="benefit-icon" />
              <h3>Smart Recommendations</h3>
              <p>Personalized investment suggestions based on your goals</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Financial Analyst. All rights reserved.</p>
        <small>
          Investment involves risk. Past performance is not indicative of future results.
          Financial Analyst is a decision-support tool and does not constitute financial advice.
        </small>
      </footer>
    </div>
  );
} 