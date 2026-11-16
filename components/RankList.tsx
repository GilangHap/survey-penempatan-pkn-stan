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
        <ol className="overflow-hidden rounded-[10px] border border-line bg-surface">
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
      className={`flex items-center gap-2 border-b border-line bg-surface px-3 last:border-0 sm:gap-3 sm:px-4 ${
        isDragging
          ? "relative z-20 shadow-[0_12px_28px_rgba(23,26,30,0.14)] ring-1 ring-accent/25"
          : ""
      }`}
    >
      <span
        className={`w-6 shrink-0 text-[13px] tabular-nums ${
          index < 3 ? "font-semibold text-ink" : "text-muted"
        }`}
      >
        {index + 1}
      </span>
      <span className="flex-1 py-3 text-[14px] leading-snug sm:text-[15px]">{id}</span>
      <span className="flex shrink-0 items-center">
        <IconButton
          label={`Naikkan ${id}`}
          disabled={index === 0}
          onClick={() => onMove(index, -1)}
          className="hidden sm:flex"
        >
          <path d="M6 14.5l6-6 6 6" />
        </IconButton>
        <IconButton
          label={`Turunkan ${id}`}
          disabled={index === total - 1}
          onClick={() => onMove(index, 1)}
          className="hidden sm:flex"
        >
          <path d="M6 9.5l6 6 6-6" />
        </IconButton>
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`Geser ${id}`}
          className="flex h-10 w-9 cursor-grab touch-none items-center justify-center rounded-md text-muted transition-colors hover:bg-ground hover:text-ink active:cursor-grabbing"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
            <circle cx="8" cy="5" r="1.35" fill="currentColor" />
            <circle cx="12" cy="5" r="1.35" fill="currentColor" />
            <circle cx="8" cy="10" r="1.35" fill="currentColor" />
            <circle cx="12" cy="10" r="1.35" fill="currentColor" />
            <circle cx="8" cy="15" r="1.35" fill="currentColor" />
            <circle cx="12" cy="15" r="1.35" fill="currentColor" />
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
  className = "",
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`h-10 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-ground hover:text-ink disabled:opacity-25 disabled:hover:bg-transparent ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
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
