"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type Props = {
  items: string[];
  onChange: (items: string[]) => void;
};

export default function RankList({ items, onChange }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = items.indexOf(String(active.id));
    const to = items.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onChange(arrayMove(items, from, to));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    onChange(arrayMove(items, index, target));
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1.5">
          {items.map((item, index) => (
            <SortableRow
              key={item}
              id={item}
              index={index}
              total={items.length}
              onMove={move}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  index,
  total,
  onMove,
}: {
  id: string;
  index: number;
  total: number;
  onMove: (index: number, direction: -1 | 1) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
      }}
      className={`flex items-center gap-3 rounded-lg border bg-white px-3 py-2 ${
        isDragging
          ? "z-10 border-[#0b2f5e] shadow-lg"
          : "border-slate-200 shadow-sm"
      }`}
    >
      <span className="w-7 shrink-0 text-center text-xs font-semibold tabular-nums text-slate-400">
        {index + 1}
      </span>
      <span className="flex-1 text-sm leading-snug text-slate-800">{id}</span>
      <span className="flex shrink-0 items-center gap-0.5">
        <IconButton
          label={`Naikkan ${id}`}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
        >
          <path d="M6 14l6-6 6 6" />
        </IconButton>
        <IconButton
          label={`Turunkan ${id}`}
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
        >
          <path d="M6 10l6 6 6-6" />
        </IconButton>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Geser ${id}`}
          className="ml-1 flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <circle cx="8" cy="5" r="1.4" fill="currentColor" />
            <circle cx="12" cy="5" r="1.4" fill="currentColor" />
            <circle cx="8" cy="10" r="1.4" fill="currentColor" />
            <circle cx="12" cy="10" r="1.4" fill="currentColor" />
            <circle cx="8" cy="15" r="1.4" fill="currentColor" />
            <circle cx="12" cy="15" r="1.4" fill="currentColor" />
          </svg>
        </button>
      </span>
    </li>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        {children}
      </svg>
    </button>
  );
}
