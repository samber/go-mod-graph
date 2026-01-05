// Graph Statistics component

import { Package, GitBranch, HardDrive } from 'lucide-react';
import { formatBytes } from '../services/goProxy';

type GraphStatsProps = {
  nodeCount: number;
  edgeCount: number;
  totalSize?: number;
};

export const GraphStats = ({ nodeCount, edgeCount, totalSize }: GraphStatsProps) => {
  return (
    <div className="graph-stats">
      <div className="graph-stat-item">
        <Package size={16} className="graph-stat-icon" />
        <div className="graph-stat-content">
          <span className="graph-stat-value">{nodeCount}</span>
          <span className="graph-stat-label">Modules</span>
        </div>
      </div>
      <div className="graph-stat-item">
        <GitBranch size={16} className="graph-stat-icon" />
        <div className="graph-stat-content">
          <span className="graph-stat-value">{edgeCount}</span>
          <span className="graph-stat-label">Dependencies</span>
        </div>
      </div>
      {totalSize !== undefined && totalSize > 0 && (
        <div className="graph-stat-item">
          <HardDrive size={16} className="graph-stat-icon" />
          <div className="graph-stat-content">
            <span className="graph-stat-value">{formatBytes(totalSize)}</span>
            <span className="graph-stat-label">Total Size</span>
          </div>
        </div>
      )}
    </div>
  );
};
