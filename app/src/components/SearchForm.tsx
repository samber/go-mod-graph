// Search Form component - contains the input, selector, submit button, and examples

import { useState } from 'react';
import { Search, Sparkles, Package } from 'lucide-react';
import { Loader2 as Loader } from './Loader';
import { ReleaseSelector } from './ReleaseSelector';
import { formatBytes } from '../services/goProxy';

type SearchFormProps = {
  moduleInput: string;
  onModuleInputChange: (value: string) => void;
  releases: string[];
  selectedRelease: string | null;
  onReleaseSelect: (release: string) => void;
  onReleaseClear: () => void;
  loading: boolean;
  onExampleClick: (modulePath: string) => void;
  nodeCount?: number;
  totalSize?: number;
  includeWeights?: boolean;
};

const EXAMPLES = [
  { path: 'github.com/stretchr/testify', name: 'testify' },
  { path: 'github.com/gin-gonic/gin', name: 'gin' },
  { path: 'github.com/samber/lo', name: 'lo' },
  { path: 'github.com/spf13/cobra', name: 'cobra' },
  { path: 'github.com/go-gorm/gorm', name: 'gorm' },
];

export const SearchForm = ({
  moduleInput,
  onModuleInputChange,
  releases,
  selectedRelease,
  onReleaseSelect,
  onReleaseClear,
  loading,
  onExampleClick,
  nodeCount,
  totalSize,
  includeWeights,
}: SearchFormProps) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  return (
    <>
      {/* Input Group */}
      <div className="search-input-wrapper">
        <div className="search-input-group">
          <div className="search-input-icon">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={moduleInput}
            onChange={(e) => onModuleInputChange(e.target.value)}
            placeholder="Enter Go module path (e.g., github.com/stretchr/testify)"
            className="search-input"
            autoComplete="off"
            spellCheck={false}
          />
          <ReleaseSelector
            releases={releases}
            selectedRelease={selectedRelease}
            onReleaseSelect={onReleaseSelect}
            onReleaseClear={onReleaseClear}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !moduleInput.trim()}
          className="search-button"
          title={moduleInput.trim() ? 'Analyze dependencies' : 'Enter a module path first'}
        >
          {loading ? (
            <>
              <Loader />
              Loading...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analyze
            </>
          )}
        </button>
      </div>

      {/* Examples */}
      <div className="examples">
        <span className="examples-label">Try an example:</span>
        <div className="examples-list">
          {EXAMPLES.map((example, index) => (
            <button
              key={example.path}
              type="button"
              className={`example-button ${focusedIndex === index ? 'example-button-focused' : ''}`}
              onClick={() => onExampleClick(example.path)}
              onMouseEnter={() => setFocusedIndex(index)}
              onMouseLeave={() => setFocusedIndex(null)}
              title={`Load ${example.path}`}
            >
              <span className="example-button-name">{example.name}</span>
            </button>
          ))}
        </div>
        {nodeCount !== undefined && nodeCount > 0 && (
          <div className="examples-stats">
            <Package size={14} />
            <span className="examples-stats-text">
              {nodeCount} dependenc{nodeCount > 1 ? 'ies' : 'y'} loaded
              {includeWeights && totalSize !== undefined && totalSize > 0 && (
                <span> · {formatBytes(totalSize)}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </>
  );
};
