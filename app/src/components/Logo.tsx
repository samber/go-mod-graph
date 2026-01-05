// Go Module Graph Logo component

export const GoModGraphLogo = () => (
  <svg width="40" height="40" viewBox="0 0 128 128" fill="none" className="app-logo">
    <defs>
      <linearGradient id="bg-gradient" x1="0" y1="0" x2="128" y2="128">
        <stop offset="0%" stopColor="#00ADD8"/>
        <stop offset="100%" stopColor="#007D9C"/>
      </linearGradient>
      <linearGradient id="node-gradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4FD1C5"/>
        <stop offset="100%" stopColor="#38B2AC"/>
      </linearGradient>
    </defs>

    {/* Background */}
    <rect width="128" height="128" rx="24" fill="url(#bg-gradient)"/>

    {/* Graph edges */}
    <g stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4">
      <line x1="32" y1="48" x2="64" y2="32"/>
      <line x1="32" y1="48" x2="64" y2="64"/>
      <line x1="96" y1="48" x2="64" y2="32"/>
      <line x1="96" y1="48" x2="64" y2="64"/>
      <line x1="64" y1="64" x2="64" y2="96"/>
      <line x1="64" y1="32" x2="64" y2="16"/>
      <line x1="32" y1="48" x2="16" y2="64"/>
      <line x1="96" y1="48" x2="112" y2="64"/>
    </g>

    {/* Graph nodes */}
    <g>
      {/* Center node */}
      <circle cx="64" cy="64" r="14" fill="#FFFFFF"/>
      <circle cx="64" cy="64" r="10" fill="url(#node-gradient)"/>

      {/* Top node */}
      <circle cx="64" cy="32" r="10" fill="#FFFFFF"/>
      <circle cx="64" cy="32" r="7" fill="url(#node-gradient)"/>

      {/* Left node */}
      <circle cx="32" cy="48" r="10" fill="#FFFFFF"/>
      <circle cx="32" cy="48" r="7" fill="url(#node-gradient)"/>

      {/* Right node */}
      <circle cx="96" cy="48" r="10" fill="#FFFFFF"/>
      <circle cx="96" cy="48" r="7" fill="url(#node-gradient)"/>

      {/* Bottom node */}
      <circle cx="64" cy="96" r="8" fill="#FFFFFF"/>
      <circle cx="64" cy="96" r="5" fill="url(#node-gradient)"/>

      {/* Small satellite nodes */}
      <circle cx="64" cy="16" r="5" fill="#FFFFFF"/>
      <circle cx="16" cy="64" r="5" fill="#FFFFFF"/>
      <circle cx="112" cy="64" r="5" fill="#FFFFFF"/>
    </g>

    {/* { } symbol representing Go/mod */}
    <g fill="#FFFFFF" fontFamily="monospace" fontSize="20" fontWeight="bold" textAnchor="middle">
      <text x="64" y="69" style={{ textShadow: '0 0 4px rgba(0,0,0,0.2)' }}>{'{ }'}</text>
    </g>
  </svg>
);
