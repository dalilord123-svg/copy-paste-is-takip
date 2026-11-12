"use client";

import { GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import MultiEmployeeSelect from "./MultiEmployeeSelect";

import {
  EmployeeOption,
  WorkflowStepItem,
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

export default function WorkflowStepCard({
  step,
  employees,
  onToggle,
  onEmployeesChange,
}: Props) {
  return (
    <Card
      className={`transition-all border

      ${
        step.enabled
          ? ""
          : "opacity-50 bg-muted"
      }`}
    >
      <CardContent className="p-5">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <GripVertical
              className="cursor-grab text-gray-400"
              size={20}
            />

            <div>

              <h3 className="font-semibold">

                {step.stationName}

              </h3>

              <p className="text-xs text-gray-500">

                İstasyon

              </p>

            </div>

          </div>

          <Switch
            checked={step.enabled}
            onCheckedChange={(checked) =>
              onToggle(step.id, checked)
            }
          />

        </div>

        <div className="mt-5">

          <label className="text-sm font-medium mb-2 block">

            Personeller

          </label>

          <MultiEmployeeSelect
            employees={employees}
            value={step.employeeIds}
            disabled={!step.enabled}
            onChange={(ids) =>
              onEmployeesChange(step.id, ids)
            }
          />

        </div>

      </CardContent>
    </Card>
  );
}