"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";

import WorkflowStepCard from "./WorkflowStepCard";

import {
  WorkflowStepItem,
  EmployeeOption,
} from "./types";

interface Props {
  step: WorkflowStepItem;

  employees: EmployeeOption[];

  onToggle: (
    id: string,
    enabled: boolean
  ) => void;

  onEmployeesChange: (
    id: string,
    employeeIds: string[]
  ) => void;
}

export default function SortableStep({
  step,
  employees,
  onToggle,
  onEmployeesChange,
}: Props) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <WorkflowStepCard
        step={step}
        employees={employees}
        onToggle={onToggle}
        onEmployeesChange={onEmployeesChange}
      />
    </div>
  );
}