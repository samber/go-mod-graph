// Modern Loading Spinner component with animated rings

export const Loader2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Outer ring */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.15"
    />
    {/* Animated outer ring segment */}
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="20 40"
      className="loading-spinner-outer"
    />
    {/* Middle ring */}
    <circle
      cx="12"
      cy="12"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.25"
    />
    {/* Animated middle ring segment */}
    <circle
      cx="12"
      cy="12"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="12 32"
      className="loading-spinner-middle"
    />
    {/* Inner ring */}
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeOpacity="0.35"
    />
    {/* Animated inner ring segment */}
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeDasharray="6 20"
      className="loading-spinner-inner"
    />
  </svg>
);
