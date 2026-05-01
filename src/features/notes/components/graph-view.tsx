import { useEffect, useRef } from "react";
import ForceGraph, { type GraphData, type NodeObject, type LinkObject } from "force-graph";
import type { NotesGraph } from "../lib/types";

interface GraphViewProps {
  graph: NotesGraph;
  onNodeClick: (slug: string) => void;
}

export function GraphView({ graph, onNodeClick }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ReturnType<typeof ForceGraph> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const data: GraphData = {
      nodes: graph.nodes.map((n) => ({
        ...n,
        __color: n.category === "vault" ? "#f9a8d4" : n.category === "articles" ? "#fb923c" : n.category === "people" ? "#818cf8" : "#34d399",
      })),
      links: graph.links.map((l) => ({ source: l.source, target: l.target })),
    };

    const fg = ForceGraph()(containerRef.current)
      .graphData(data)
      .nodeId("id")
      .nodeVal("val")
      .nodeColor("__color" as any)
      .linkColor(() => "rgba(249, 168, 212, 0.3)")
      .linkWidth(0.5)
      .width(containerRef.current.clientWidth)
      .height(500)
      .onNodeClick((node: NodeObject) => {
        const n = node as any;
        if (n.id && onNodeClick) {
          onNodeClick(n.id);
        }
      })
      .nodeLabel("name")
      .enableNodeDrag(false)
      .enableZoomInteraction(true);

    graphRef.current = fg;

    const handleResize = () => {
      if (containerRef.current) {
        fg.width(containerRef.current.clientWidth);
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      fg._destructor?.();
    };
  }, [graph, onNodeClick]);

  return <div ref={containerRef} className="w-full h-[500px]" />;
}
