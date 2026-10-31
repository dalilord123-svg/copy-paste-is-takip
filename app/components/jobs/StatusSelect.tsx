"use client";

import { useState } from "react";
import { ProductionStepStatus } from "@prisma/client";

type Props = {
  jobId: string;
  stepId: string;
  currentStatus: ProductionStepStatus;
};

const statuses: ProductionStepStatus[] = [
  "BEKLIYOR",
  "HAZIR",
  "DEVAM_EDIYOR",
  "BEKLEMEDE",
  "TAMAMLANDI",
  "IPTAL",
];

export default function StatusSelect({
  jobId,
  stepId,
  currentStatus,
}: Props) {
  const [status, setStatus] =
    useState<ProductionStepStatus>(currentStatus);

  const [loading, setLoading] = useState(false);

  async function updateStatus(
    newStatus: ProductionStepStatus
  ) {
    setStatus(newStatus);
    setLoading(true);

    try {
      await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          stepId,
          status: newStatus,
        }),
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      disabled={loading}
      onChange={(e) =>
        updateStatus(
          e.target.value as ProductionStepStatus
        )
      }
      className="border rounded-lg px-3 py-2"
    >
      {statuses.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}