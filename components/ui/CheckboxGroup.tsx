"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface CheckboxGroupProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

export function CheckboxGroup({ options, selected = [], onChange }: CheckboxGroupProps) {
    const handleCheck = (option: string, checked: boolean) => {
        if (checked) {
            onChange([...selected, option]);
        } else {
            onChange(selected.filter((item) => item !== option));
        }
    };

    return (
        <div className="flex flex-wrap gap-4">
            {options.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                        id={`option-${option}`}
                        checked={selected.includes(option)}
                        onChange={(e) => handleCheck(option, e.target.checked)}
                    />
                    <Label
                        htmlFor={`option-${option}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        {option}
                    </Label>
                </div>
            ))}
        </div>
    );
}
