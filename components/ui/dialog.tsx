import * as React from "react"
import { X } from "lucide-react"

export const DialogContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
}>({
    open: false,
    setOpen: () => { }
});

export const Dialog = ({ children, open: controlledOpen, onOpenChange }: any) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = (newOpen: boolean) => {
        if (onOpenChange) {
            onOpenChange(newOpen);
        }
        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }
    };

    return (
        <DialogContext.Provider value={{ open, setOpen }}>
            {children}
        </DialogContext.Provider>
    );
};

export const DialogTrigger = ({ asChild, children, className }: any) => {
    const { setOpen } = React.useContext(DialogContext);
    return (
        <div onClick={() => setOpen(true)} className={`inline-block cursor-pointer ${className}`}>
            {children}
        </div>
    );
};

export const DialogContent = ({ children, className }: any) => {
    const { open, setOpen } = React.useContext(DialogContext);
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Content */}
            <div className={`relative z-50 w-full max-w-lg bg-white p-6 shadow-lg rounded-lg animate-in zoom-in-95 duration-200 ${className}`}>
                <button
                    onClick={() => setOpen(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
};

export const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`}
        {...props}
    />
);

export const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={`text-lg font-semibold leading-none tracking-tight ${className}`}
        {...props}
    />
);
