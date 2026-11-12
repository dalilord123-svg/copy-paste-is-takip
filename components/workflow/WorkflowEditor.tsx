"use client";

import { useMemo } from "react";

import {
  DndContext,
  PointerSensor,
  DragEndEvent,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import SortableStep from "./SortableStep";

import {
  WorkflowStepItem,
  EmployeeOption,
} from "./types";

interface WorkflowEditorProps {
  steps: WorkflowStepItem[];

  employees: EmployeeOption[];

  setSteps: React.Dispatch<
    React.SetStateAction<WorkflowStepItem[]>
  >;
}

export default function WorkflowEditor({
  steps,
  employees,
  setSteps,
}: WorkflowEditorProps) {

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const sortableItems = useMemo(
    () => steps.map((x) => x.id),
    [steps]
  );

  function toggleStep(
    id: string,
    enabled: boolean
  ) {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              enabled,
            }
          : step
      )
    );
  }

  function changeEmployees(
    id: string,
    employeeIds: string[]
  ) {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              employeeIds,
            }
          : step
      )
    );
  }

  function handleDragEnd(
    event: DragEndEvent
  ) {
    const { active, over } = event;

    if (!over) return;

    if (active.id === over.id) return;

    setSteps((items) => {

      const oldIndex = items.findIndex(
        (item) => item.id === active.id
      );

      const newIndex = items.findIndex(
        (item) => item.id === over.id
      );

      const moved = arrayMove(
        items,
        oldIndex,
        newIndex
      );

      return moved.map((item, index) => ({
        ...item,
        order: index + 1,
      }));

    });
  }

  return (

    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >

      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >

        <div className="space-y-4"></div>
                  {steps.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
              Bu şablonda aktif istasyon bulunamadı.
            </div>
          )}

          {steps.map((step) => (
            <SortableStep
              key={step.id}
              step={step}
              employees={employees}
              onToggle={toggleStep}
              onEmployeesChange={changeEmployees}
            />
          ))}
        </div>

      </SortableContext>

    </DndContext>
  );
}