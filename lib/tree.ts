import type { GraphArtifact, GraphNode } from "@/types";

export type OfficeTreeNode = GraphNode & {
  children: OfficeTreeNode[];
};

export function getOrgNodes(graph: GraphArtifact) {
  return graph.nodes.filter((node) => node.type === "org");
}

export function buildOfficeTree(graph: GraphArtifact): OfficeTreeNode[] {
  const orgNodes = getOrgNodes(graph);
  const byId = new Map<string, OfficeTreeNode>(
    orgNodes.map((node) => [node.id, { ...node, children: [] }])
  );

  const roots: OfficeTreeNode[] = [];

  graph.edges
    .filter((edge) => edge.type === "parent_child")
    .forEach((edge) => {
      const parent = byId.get(edge.source);
      const child = byId.get(edge.target);
      if (parent && child) {
        parent.children.push(child);
      }
    });

  byId.forEach((node) => {
    const hasParent = graph.edges.some(
      (edge) => edge.type === "parent_child" && edge.target === node.id
    );
    if (!hasParent) {
      roots.push(node);
    }
  });

  const sortTree = (nodes: OfficeTreeNode[]) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label));
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
}

export function findNodeById(graph: GraphArtifact, id: string) {
  return graph.nodes.find((node) => node.id === id) ?? null;
}

export function getSourceMap(graph: GraphArtifact) {
  return new Map(graph.nodes.filter((node) => node.type === "source").map((node) => [node.id, node]));
}
