"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { EmployeeOption } from "./types";

interface Props {
    employees: EmployeeOption[];
    value: string | null;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export default function EmployeeSelect({
    employees,
    value,
    disabled,
    onChange,
}: Props) {
    return (
        <Select
            value={value ?? ""}
            onValueChange={onChange}
            disabled={disabled}
        >
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Personel Seçiniz" />
            </SelectTrigger>

            <SelectContent>

                {employees.map((employee) => (

                    <SelectItem
                        key={employee.id}
                        value={employee.id}
                    >
                        {employee.name}
                    </SelectItem>

                ))}

            </SelectContent>

        </Select>
    );
}