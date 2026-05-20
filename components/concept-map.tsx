"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Plus, Link2, Trash2 } from "lucide-react";

type CmNode = { id: string; label: string; x: number; y: number };
type CmEdge = { id: string; from: string; to: string };

export type ConceptMapData = {
  nodes: CmNode[];
  edges: CmEdge[];
  editCount: number;
  durationSec: number;
};

export type ConceptMapHandle = {
  getData: () => ConceptMapData;
};

const NODE_W = 112;
const NODE_H = 34;

type DragState = {
  nodeId: string;
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  hasMoved: boolean;
};

type ConceptMapProps = Record<string, unknown>;

const ConceptMap = forwardRef<ConceptMapHandle, ConceptMapProps>(function ConceptMap(_, ref) {
  const [nodes, setNodes] = useState<CmNode[]>([]);
  const [edges, setEdges] = useState<CmEdge[]>([]);
  const [editCount, setEditCount] = useState(0);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"normal" | "connecting">("normal");
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const startTime = useRef(Date.now());
  const dragRef = useRef<DragState | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      nodes,
      edges,
      editCount,
      durationSec: Math.floor((Date.now() - startTime.current) / 1000)
    })
  }));

  function addNode() {
    const label = input.trim();
    if (!label) return;
    const el = canvasRef.current;
    const w = el?.clientWidth ?? 560;
    const h = el?.clientHeight ?? 320;
    const x = Math.max(8, Math.min(w - NODE_W - 8, 40 + Math.random() * (w - NODE_W - 80)));
    const y = Math.max(8, Math.min(h - NODE_H - 8, 30 + Math.random() * (h - NODE_H - 60)));
    setNodes((ns) => [...ns, { id: crypto.randomUUID(), label, x, y }]);
    setEditCount((c) => c + 1);
    setInput("");
  }

  function handleNodePointerDown(e: React.PointerEvent, nodeId: string) {
    if (mode === "connecting") {
      e.stopPropagation();
      e.preventDefault();
      if (!connectFrom) {
        setConnectFrom(nodeId);
      } else if (connectFrom !== nodeId) {
        const exists = edges.some(
          (ed) =>
            (ed.from === connectFrom && ed.to === nodeId) ||
            (ed.from === nodeId && ed.to === connectFrom)
        );
        if (!exists) {
          setEdges((es) => [...es, { id: crypto.randomUUID(), from: connectFrom, to: nodeId }]);
          setEditCount((c) => c + 1);
        }
        setConnectFrom(null);
        setMode("normal");
      }
      return;
    }
    e.currentTarget.setPointerCapture(e.pointerId);
    const node = nodes.find((n) => n.id === nodeId)!;
    dragRef.current = {
      nodeId,
      startX: e.clientX,
      startY: e.clientY,
      origX: node.x,
      origY: node.y,
      hasMoved: false
    };
    setSelected(nodeId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const { nodeId, startX, startY, origX, origY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragRef.current.hasMoved = true;
    setNodes((ns) =>
      ns.map((n) => (n.id === nodeId ? { ...n, x: origX + dx, y: origY + dy } : n))
    );
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function deleteSelected() {
    if (!selected) return;
    setNodes((ns) => ns.filter((n) => n.id !== selected));
    setEdges((es) => es.filter((e) => e.from !== selected && e.to !== selected));
    setEditCount((c) => c + 1);
    setSelected(null);
  }

  function deleteEdge(edgeId: string) {
    setEdges((es) => es.filter((e) => e.id !== edgeId));
    setEditCount((c) => c + 1);
  }

  function nodeCenterX(id: string) {
    return (nodes.find((n) => n.id === id)?.x ?? 0) + NODE_W / 2;
  }
  function nodeCenterY(id: string) {
    return (nodes.find((n) => n.id === id)?.y ?? 0) + NODE_H / 2;
  }

  const connectingLabel = connectFrom
    ? `두 번째 개념어 클릭`
    : `연결할 첫 번째 개념어 클릭`;

  return (
    <div className="flex h-full flex-col gap-2">
      {/* 입력 */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNode()}
          placeholder="개념어 입력 후 Enter"
          className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm"
        />
        <button
          onClick={addNode}
          className="flex items-center gap-1 rounded-md bg-moss px-3 py-1.5 text-xs font-semibold text-white"
        >
          <Plus size={13} /> 추가
        </button>
      </div>

      {/* 툴바 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (mode === "connecting") {
              setMode("normal");
              setConnectFrom(null);
            } else {
              setMode("connecting");
            }
          }}
          className={`flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs ${
            mode === "connecting"
              ? "border-signal bg-blue-50 font-semibold text-signal"
              : "border-stone-300 text-stone-700 hover:bg-stone-50"
          }`}
        >
          <Link2 size={12} />
          {mode === "connecting" ? connectingLabel : "연결 모드"}
        </button>
        <button
          onClick={deleteSelected}
          disabled={!selected}
          className="flex items-center gap-1 rounded-md border border-stone-300 px-2.5 py-1 text-xs text-rust disabled:opacity-40"
        >
          <Trash2 size={12} /> 선택 삭제
        </button>
        <span className="ml-auto text-[10px] text-stone-400">
          노드 {nodes.length} · 연결 {edges.length} · 수정 {editCount}회
        </span>
      </div>

      {/* 캔버스 */}
      <div
        ref={canvasRef}
        className="relative flex-1 overflow-hidden rounded-xl border-2 border-dashed border-stone-200 bg-stone-50"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={() => { if (mode !== "connecting") setSelected(null); }}
      >
        {/* 엣지 SVG 레이어 */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#a8a29e" />
            </marker>
          </defs>
          {edges.map((edge) => (
            <line
              key={edge.id}
              x1={nodeCenterX(edge.from)}
              y1={nodeCenterY(edge.from)}
              x2={nodeCenterX(edge.to)}
              y2={nodeCenterY(edge.to)}
              stroke="#a8a29e"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          ))}
          {/* 연결 중 점선 미리보기: connectFrom 노드 중심에서 동적으로 그리려면 state가 필요해 생략 */}
        </svg>

        {/* 노드 */}
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }}
            className={`absolute flex cursor-grab items-center justify-center select-none rounded-lg border px-2 text-xs font-semibold shadow-sm transition-colors active:cursor-grabbing ${
              connectFrom === node.id
                ? "border-moss bg-green-50 text-moss shadow-md"
                : selected === node.id
                ? "border-signal bg-blue-50 text-signal shadow-md"
                : mode === "connecting"
                ? "cursor-pointer border-stone-300 bg-white text-stone-700 hover:border-signal hover:bg-blue-50"
                : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
            }`}
            onPointerDown={(e) => handleNodePointerDown(e, node.id)}
          >
            <span className="truncate">{node.label}</span>
          </div>
        ))}

        {nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-stone-400">
            <span>위에서 개념어를 추가하세요</span>
            <span className="text-[10px]">드래그로 이동 · 연결 모드로 관계선 추가</span>
          </div>
        )}
      </div>

      {/* 연결 목록 */}
      {edges.length > 0 && (
        <div className="max-h-20 overflow-y-auto rounded-md border border-stone-100 bg-white p-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">연결 목록</p>
          <div className="space-y-0.5">
            {edges.map((edge) => {
              const fn = nodes.find((n) => n.id === edge.from);
              const tn = nodes.find((n) => n.id === edge.to);
              return (
                <div key={edge.id} className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {fn?.label} → {tn?.label}
                  </span>
                  <button onClick={() => deleteEdge(edge.id)} className="ml-2 text-stone-300 hover:text-rust">
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

export default ConceptMap;
