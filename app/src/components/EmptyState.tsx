// Empty State component

import { Package, Network, GitBranch, ArrowRight, Heart } from 'lucide-react';
import { GoModGraphLogo } from './Logo';

type EmptyStateProps = {
  onExampleClick?: (modulePath: string) => void;
};

export const EmptyState = ({ onExampleClick }: EmptyStateProps) => {
  const features = [
    {
      icon: <Package size={20} />,
      title: 'Visualize Dependencies',
      description: 'See the complete dependency tree of any Go module',
    },
    {
      icon: <Network size={20} />,
      title: 'Interactive Graph',
      description: 'Navigate and explore dependencies with an interactive graph',
    },
    {
      icon: <GitBranch size={20} />,
      title: 'Version Support',
      description: 'Analyze specific versions or compare different releases',
    },
  ];

  const examplePath = 'github.com/stretchr/testify';

  const handleClick = () => {
    if (onExampleClick) {
      onExampleClick(examplePath);
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-state-content">
        {/* Logo */}
        <div className="empty-state-logo">
          <GoModGraphLogo />
        </div>

        {/* Heading */}
        <h1 className="empty-state-title">
          Go Module Dependency Visualizer
        </h1>

        {/* Description */}
        <p className="empty-state-description">
          Explore and visualize Go module dependencies with an interactive graph.
          Enter a module path above to get started.
        </p>

        {/* Example */}
        <button
          className="empty-state-example"
          onClick={handleClick}
          type="button"
        >
          <span className="empty-state-example-label">Try:</span>
          <code className="empty-state-example-code">{examplePath}</code>
          <ArrowRight size={16} className="empty-state-example-arrow" />
        </button>

        {/* Features */}
        <div className="empty-state-features">
          {features.map((feature, index) => (
            <div key={index} className="empty-state-feature">
              <div className="empty-state-feature-icon">
                {feature.icon}
              </div>
              <div className="empty-state-feature-content">
                <h3 className="empty-state-feature-title">{feature.title}</h3>
                <p className="empty-state-feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sponsor Link */}
        <a
          className="empty-state-sponsor"
          href="https://github.com/sponsors/samber"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Heart size={16} className="empty-state-sponsor-icon" fill="currentColor" />
          <span>Sponsor @samber on GitHub</span>
        </a>

        {/* Hint */}
        <div className="empty-state-hint">
          <svg
            className="empty-state-hint-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span>Click on nodes in the graph to view package documentation on pkg.go.dev</span>
        </div>
      </div>
    </div>
  );
};
