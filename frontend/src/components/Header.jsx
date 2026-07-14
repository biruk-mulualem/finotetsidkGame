// src/components/Header.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const styles = {
  header: {
    padding: '8px 20px',
    background: 'rgb(250, 253, 245)',
    borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerHidden: {
    display: 'none',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '80px',
  },
  headerCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    minWidth: '80px',
    justifyContent: 'flex-end',
  },
  headerH1: {
    fontSize: '1.3rem',
    color: '#262524',
    textShadow: '0 0 20px rgba(22, 22, 21, 0.3)',
    margin: 0,
  },
  tagline: {
    fontSize: '0.6rem',
    color: '#a8b5d9',
    fontStyle: 'italic',
    margin: 0,
  },
  navLink: {
    color: '#121111',
    textDecoration: 'none',
    padding: '6px 14px',
    border: '1px solid rgba(27, 27, 26, 0.3)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    background: 'rgba(255, 215, 0, 0.05)',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap',
  },
  navLinkHover: {
    background: 'rgba(255, 215, 0, 0.15)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 10px rgba(255, 215, 0, 0.2)',
  },
};

const Header = ({ hidden = false }) => {
  const [hoverNav, setHoverNav] = useState(false);
  const location = useLocation();

  // Check if we're on the admin page
  const isAdminPage = location.pathname === '/cpanel';

  if (hidden) {
    return <div style={styles.headerHidden} />;
  }

  return (
    <header style={styles.header}>
      <div style={styles.headerLeft}>
        {/* Empty div to balance the layout */}
      </div>
      
      <div style={styles.headerCenter}>
        <h1 style={styles.headerH1}>🏛️ Finotetsdek</h1>
        <p style={styles.tagline}>Spiritual Q&A Game</p>
      </div>
      
      <div style={styles.headerRight}>
        <Link 
          to={isAdminPage ? '/select-type' : '/cpanel'}
          style={{
            ...styles.navLink,
            ...(hoverNav ? styles.navLinkHover : {}),
          }}
          onMouseEnter={() => setHoverNav(true)}
          onMouseLeave={() => setHoverNav(false)}
        >
          {isAdminPage ? '🎮 Go to Game' : '⚙️ Admin'}
        </Link>
      </div>
    </header>
  );
};

export default Header;