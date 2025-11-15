import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';

function Header({ user, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container header-content">
        <Link to="/" className="logo" onClick={closeMenu}>
          <h1>Fitness & Nutrition Tracker</h1>
        </Link>
        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          {user ? (
            <>
              <span className="user-name">Welcome, {user.name}</span>
              <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>Dashboard</NavLink>
              <NavLink to="/log-food" className="nav-link" onClick={closeMenu}>Log Food</NavLink>
              <NavLink to="/log-workout" className="nav-link" onClick={closeMenu}>Log Workout</NavLink>
              <NavLink to="/profile" className="nav-link" onClick={closeMenu}>Profile</NavLink>
              <button onClick={() => { onLogout(); closeMenu(); }} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link" onClick={closeMenu}>Login</NavLink>
              <Link to="/signup" className="btn btn-primary" onClick={closeMenu}>Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
