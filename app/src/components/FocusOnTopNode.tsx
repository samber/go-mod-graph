// Component to focus on top node after layout

import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import type { Node } from 'reactflow';

type DependencyNodeData = {
  id: string;
  path: string;
  release: string;
  size?: number;
  x: number;
  y: number;
  children: any[];
};

type FocusOnTopNodeProps = {
  nodes: Node<DependencyNodeData>[];
  hasFocusedRef: React.MutableRefObject<boolean>;
};

export const FocusOnTopNode = ({ nodes: nodesToFocus, hasFocusedRef }: FocusOnTopNodeProps) => {
  const { fitView } = useReactFlow();

  useEffect(() => {
    if (nodesToFocus.length > 0 && !hasFocusedRef.current) {
      // Find the top node (smallest y position)
      const topNode = nodesToFocus.reduce((top, node) => {
        return node.position.y < top.position.y ? node : top;
      });

      // Focus on the top node with a slight delay to ensure layout is complete
      setTimeout(() => {
        fitView({
          nodes: [topNode],
          padding: 0.2,
          duration: 400,
        });
        hasFocusedRef.current = true;
      }, 100);
    }
  }, [nodesToFocus, fitView, hasFocusedRef]);

  return null;
};
