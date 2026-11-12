export interface WorkflowStepItem {
  id: string;

  stationId: string;

  stationName: string;

  enabled: boolean;

  employeeIds: string[];

  order: number;
}

export interface EmployeeOption {
  id: string;

  name: string;
}