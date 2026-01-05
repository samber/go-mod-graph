// Custom Node component for ReactFlow

import { Handle, Position } from 'reactflow';
import { formatBytes, getSizeColor, getSizeTextColor } from '../services/goProxy';

type DependencyNodeData = {
  id: string;
  path: string;
  release: string;
  size?: number;
  x: number;
  y: number;
  children: any[];
};

type CustomNodeProps = {
  data: DependencyNodeData;
  selected?: boolean;
};

export const CustomNode = ({ data, selected }: CustomNodeProps) => {
  // Truncate path for display, show full path in tooltip
  const displayPath = data.path.length > 50
    ? `${data.path.substring(0, 47)}...`
    : data.path;

  const url = !data.release
    ? `https://pkg.go.dev/${data.path}`
    : `https://pkg.go.dev/${data.path}@${data.release}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`custom-node${selected ? ' custom-node-selected' : ''}`}
      title={`View ${data.path} on pkg.go.dev`}
    >
      <Handle type="target" position={Position.Top} className="custom-node-handle" />
      <div className="custom-node-content">
        <div className="custom-node-path" title={data.path}>
          {displayPath}
        </div>
        {data.release && (
          <div className="custom-node-release-tag" title={`Release: ${data.release}`}>
            {data.release}
          </div>
        )}
        {data.size !== undefined && data.size !== null && (
          <div
            className="custom-node-size-tag"
            style={{
              backgroundColor: getSizeColor(data.size),
              color: getSizeTextColor(data.size),
            }}
            title={`Module size: ${formatBytes(data.size)}`}
          >
            <svg
              className="custom-node-size-icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            <span>{formatBytes(data.size)}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="custom-node-handle" />
    </a>
  );
};
