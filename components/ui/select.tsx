import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

// Context for Select
const SelectContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}>({
    value: "",
    onValueChange: () => { },
    open: false,
    setOpen: () => { }
});

export const Select = ({ children, onValueChange, defaultValue, value: controlledValue, disabled }: any) => {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState(defaultValue || "");

    const currentValue = controlledValue !== undefined ? controlledValue : value;

    const handleValueChange = (val: string) => {
        setValue(val);
        if (onValueChange) onValueChange(val);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = ({ children, className }: any) => {
    const { open, setOpen, value } = React.useContext(SelectContext);
    return (
        <button
            type="button"
            className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            onClick={() => setOpen(!open)}
        >
            {value ? <span className="capitalize">{value.replace(/_/g, " ")}</span> : <span className="opacity-50">Seleccionar...</span>}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

export const SelectValue = ({ placeholder }: any) => {
    // Value render logic is in Trigger for simplicity here, placeholder is fallback
    return null;
};

export const SelectContent = ({ children, className }: any) => {
    const { open } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 text-gray-950 shadow-md animate-in fade-in-80 zoom-in-95 mt-1 w-full ${className}`}>
            <div className="w-full p-1">
                {children}
            </div>
        </div>
    );
};

export const SelectItem = ({ value, children, className }: any) => {
    const { onValueChange, value: selectedValue } = React.useContext(SelectContext);
    return (
        <div
            className={`relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer ${className}`}
            onClick={() => onValueChange(value)}
        >
            {selectedValue === value && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                </span>
            )}
            <span className="truncate">{children}</span>
        </div>
    );
};
