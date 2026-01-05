// Release Selector component with inline search

import { useState, useMemo, useRef, useEffect } from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';

// Sort releases by date (descending) - pseudo-releases have timestamps
const sortReleasesByDate = (releases: string[]): string[] => {
  return [...releases].sort((a, b) => {
    // Extract timestamp from pseudo-versions (format: v0.0.0-YYYYMMDDhhmmss-...)
    const pseudoVersionRegex = /-v?\d+\.\d+\.\d+(\.\d+)?\.(\d{14})-/;
    const aMatch = a.match(pseudoVersionRegex);
    const bMatch = b.match(pseudoVersionRegex);

    if (aMatch && bMatch) {
      // Both are pseudo-versions, compare by timestamp
      return bMatch[2].localeCompare(aMatch[2]);
    } else if (aMatch) {
      // a is pseudo-version, b is not - pseudo-versions are usually older
      return -1;
    } else if (bMatch) {
      // b is pseudo-version, a is not
      return 1;
    } else {
      // Both are regular versions, sort semver descending
      return b.localeCompare(a);
    }
  });
};

type ReleaseSelectorProps = {
  releases: string[];
  selectedRelease: string | null;
  onReleaseSelect: (release: string) => void;
  onReleaseClear: () => void;
};

export const ReleaseSelector = ({
  releases,
  selectedRelease,
  onReleaseSelect: onVersionSelect,
  onReleaseClear: onVersionClear,
}: ReleaseSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayValue = selectedRelease || "latest";

  // Filter versions based on search query, with "latest" at the top
  const filteredVersions = useMemo(() => {
    let versions = sortReleasesByDate(releases);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      versions = versions.filter(v => v.toLowerCase().includes(query));
    }

    // Always show "latest" at the top, unless searching and it doesn't match
    const showLatest = !searchQuery || 'latest'.includes(searchQuery);

    return showLatest ? ['latest', ...versions] : versions;
  }, [releases, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as unknown;
      if (dropdownRef.current && !dropdownRef.current.contains(target as HTMLDivElement)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="version-selector" ref={dropdownRef}>
      <button
        type="button"
        className="version-selector-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GitBranch size={16} />
        <span className="version-selector-text">
          {displayValue}
        </span>
        {selectedRelease && (
          <span
            className="version-selector-clear"
            onClick={(e) => {
              e.stopPropagation();
              onVersionClear();
            }}
          >
            ×
          </span>
        )}
        <ChevronDown size={14} className={`version-selector-chevron ${isOpen ? 'open' : ''}`} />
      </button>

      {isOpen && (
        <div className="version-selector-dropdown">
          <div className="version-selector-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Release"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="version-selector-list">
            {filteredVersions.length === 0 ? (
              <div className="version-selector-no-results">No releases found</div>
            ) : (
              filteredVersions.map((v) => {
                const isLatest = v === 'latest';
                const isSelected = isLatest ? !selectedRelease : selectedRelease === v;

                return (
                  <div
                    key={v}
                    className={`version-selector-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (isLatest) {
                        onVersionClear();
                      } else {
                        onVersionSelect(v);
                      }
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                  >
                    {v}
                  </div>
                );
              })
            )}
            {filteredVersions.length > 100 && (
              <div className="version-selector-more">
                ...and {filteredVersions.length - 100} more
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
