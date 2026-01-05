// Settings Panel component
import { Globe, RotateCcw, Check, Scale } from 'lucide-react';

type SettingsPanelProps = {
  proxyUrl: string;
  onProxyUrlChange: (url: string) => void;
  onClose: () => void;
  includeWeights: boolean;
  onIncludeWeightsChange: (checked: boolean) => void;
};

export const SettingsPanel = ({
  proxyUrl,
  onProxyUrlChange,
  onClose,
  includeWeights,
  onIncludeWeightsChange,
}: SettingsPanelProps) => {
  const handleReset = () => {
    onProxyUrlChange('https://proxy.golang.org');
  };

  return (
    <div className="settings">
      <div className="max-w">
        <div className="settings-content">
          {/* Proxy URL Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Globe size={16} className="settings-section-icon" />
              <label className="settings-section-label">Go Module Proxy URL</label>
            </div>
            <div className="settings-input-group">
              <input
                type="url"
                value={proxyUrl}
                onChange={(e) => onProxyUrlChange(e.target.value)}
                placeholder="https://proxy.golang.org"
                className="settings-input"
              />
              <div className="settings-button-group">
                <button
                  onClick={handleReset}
                  type="button"
                  className="settings-button settings-button-secondary"
                  title="Reset to default"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
                <button
                  onClick={onClose}
                  type="button"
                  className="settings-button settings-button-primary"
                  title="Save and close"
                >
                  <Check size={14} />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>

          {/* Display Weights Section */}
          <div className="settings-section">
            <div className="settings-section-header">
              <Scale size={16} className="settings-section-icon" />
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={includeWeights}
                  onChange={(e) => onIncludeWeightsChange(e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">Display weights</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
