// Header component

import { Settings, Github, Moon, Sun } from 'lucide-react';
import { GoModGraphLogo } from './Logo';

type HeaderProps = {
  onSettingsToggle: () => void;
  onHomeClick?: () => void;
  isDarkMode?: boolean;
  onDarkModeToggle?: () => void;
};

export const Header = ({ onSettingsToggle, onHomeClick, isDarkMode, onDarkModeToggle }: HeaderProps) => {
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onHomeClick) {
      onHomeClick();
    }
  };

  return (
    <header className="header">
      <div className="flex-row-between max-w" style={{ width: '100%' }}>
        <a
          href="/"
          className="header-logo-button"
          onClick={handleLogoClick}
          title="Go to home"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <GoModGraphLogo />
            <h1>Go Module Dependency Graph</h1>
          </div>
        </a>
        <div className="flex-row">
          {onDarkModeToggle && (
            <button
              onClick={onDarkModeToggle}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
              className="header-dark-mode-toggle"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button
            onClick={onSettingsToggle}
            title="Settings"
            type="button"
          >
            <Settings size={20} />
          </button>
          <a
            href="https://github.com/samber/go-mod-graph"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="header-github-link"
          >
            <Github size={20} />
          </a>
        </div>
      </div>
    </header>
  );
};
