"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import { Badge } from "@/components/ui/badge";

export interface EmployeeOption {
  id: string;
  name: string;
}

interface Props {
  employees: EmployeeOption[];
  value: string[];
  disabled?: boolean;
  onChange: (ids: string[]) => void;
}

export default function MultiEmployeeSelect({
  employees,
  value,
  disabled,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  }

  function remove(id: string) {
    onChange(value.filter((x) => x !== id));
  }

  return (
    <div className="space-y-3">

      <Popover open={open} onOpenChange={setOpen}>

        <PopoverTrigger asChild>

          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
          >
            Personel Ekle

            <ChevronsUpDown className="h-4 w-4 opacity-60" />

          </Button>

        </PopoverTrigger>

        <PopoverContent className="w-full p-0">

          <Command>

            <CommandInput placeholder="Personel ara..." />

            <CommandEmpty>
              Personel bulunamadı.
            </CommandEmpty>

            <CommandGroup>

              {employees.map((employee) => {

                const selected = value.includes(employee.id);

                return (

                  <CommandItem
                    key={employee.id}
                    onSelect={() => toggle(employee.id)}
                  >

                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selected
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
                    />

                    {employee.name}

                  </CommandItem>

                );
              })}

            </CommandGroup>

          </Command>

        </PopoverContent>

      </Popover>

      <div className="flex flex-wrap gap-2">

        {value.map((id) => {

          const employee = employees.find(
            (e) => e.id === id
          );

          if (!employee) return null;

          return (

            <Badge
              key={employee.id}
              variant="secondary"
              className="flex items-center gap-2"
            >

              {employee.name}

              {!disabled && (

                <X
                  size={14}
                  className="cursor-pointer"
                  onClick={() => remove(employee.id)}
                />

              )}

            </Badge>

          );

        })}

      </div>

    </div>
  );
}