"use client";

import { useState } from "react";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { formatLabel } from "@/lib/format";
import type { OfficeTreeNode } from "@/lib/tree";

function TreeRow({
  node,
  depth,
  selectedId,
  expanded,
  onToggle,
  onSelect
}: {
  node: OfficeTreeNode;
  depth: number;
  selectedId: string;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const isExpanded = expanded.has(node.id);
  const isSelected = node.id === selectedId;
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={`grid grid-cols-[24px_1fr] items-start border-l-2 py-1.5 pr-2 text-sm ${
          isSelected
            ? "border-stone-950 bg-stone-200 text-stone-950"
            : "border-transparent text-stone-800 hover:bg-stone-100"
        }`}
        style={{ paddingLeft: `${Math.max(depth * 14, 0)}px` }}
      >
        <button
          type="button"
          disabled={!hasChildren}
          onClick={() => onToggle(node.id)}
          className="h-6 w-6 text-xs text-stone-500 disabled:text-stone-300"
          aria-label={isExpanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
        >
          {hasChildren ? (isExpanded ? "-" : "+") : ""}
        </button>
        <button type="button" onClick={() => onSelect(node.id)} className="min-w-0 text-left">
          <span className="block truncate font-medium">{node.label}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-stone-500">
            {node.abbreviation ? <span>{node.abbreviation}</span> : null}
            <span>{formatLabel(String(node.metadata.org_type ?? node.type))}</span>
            <ConfidenceBadge confidence={node.confidence} />
          </span>
        </button>
      </div>
      {hasChildren && isExpanded ? (
        <ul>
          {node.children.map((child) => (
            <TreeRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function GovMapTree({
  tree,
  selectedId,
  onSelect
}: {
  tree: OfficeTreeNode[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["org.dow", "org.osd"]));

  const toggle = (id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <nav aria-label="Office tree">
      <ul className="divide-y divide-stone-200">
        {tree.map((node) => (
          <TreeRow
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            expanded={expanded}
            onToggle={toggle}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
}
