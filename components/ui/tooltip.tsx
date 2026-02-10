"use client";

import * as React from "react";

const TooltipProvider = ({ children }: { children: React.ReactNode; delayDuration?: number }) => {
    return <>{children}</>;
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);

    // Clone children to inject state/handlers
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            // @ts-ignore
            return React.cloneElement(child, { open, setOpen });
        }
        return child;
    });

    return <div className="relative inline-block">{childrenWithProps}</div>;
};

const TooltipTrigger = ({ children, asChild, open, setOpen, ...props }: any) => {
    const Comp = asChild ? React.Fragment : 'button';
    const child = React.Children.only(children);

    return React.cloneElement(child, {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
        onFocus: () => setOpen(true),
        onBlur: () => setOpen(false),
        ...props
    });
};

const TooltipContent = ({ children, side = "top", className, open, ...props }: any) => {
    if (!open) return null;

    let positionClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2"; // default top
    if (side === "right") positionClasses = "left-full top-1/2 -translate-y-1/2 ml-2";
    if (side === "bottom") positionClasses = "top-full left-1/2 -translate-x-1/2 mt-2";
    if (side === "left") positionClasses = "right-full top-1/2 -translate-y-1/2 mr-2";

    return (
        <div
            className={`absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ${positionClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
