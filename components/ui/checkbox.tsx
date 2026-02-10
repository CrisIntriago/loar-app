import * as React from "react"
import { Check } from "lucide-react"

// Simple HTML checkbox wrapper since Radix is unavailable
// But standard <input type="checkbox"> is controlled differently than Radix Checkbox.
// Radix Checkbox uses CheckedChange event. Standard uses ChangeEvent.
// CustomerForm uses: <input type="checkbox" ... onChange={e => setAccepted(e.target.checked)} />
// So I don't really need a custom component if I used standard input in CustomerForm.
// Let's check CustomerForm.tsx content...
// I wrote: 
// <input type="checkbox" id="terms" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="..." />
// So I actually didn't use the `Checkbox` component import in JSX, I just imported it but didn't use it!
// Ah, wait. Lines 3 and 7 of CustomerForm.tsx:
// import { Checkbox } from "@/components/ui/checkbox"; 
// ...
// But line 118: <input type="checkbox" ... />
// So I imported it but used native input. That's fine. 
// But to avoid "Module not found" error for the import, I should create the file or remove the import.
// I'll creating a dummy file or empty export to satisfy the import if I want to switch later, 
// OR better: I will create a proper component and update CustomerForm to use it? 
// No, standard input is easier without Radix.
// I'll just create the file exporting a simple wrapper to satisfy the import if I decide to use it, or just leave it unused but valid.

const Checkbox = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => (
        <input
            type="checkbox"
            className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className}`}
            ref={ref}
            {...props}
        />
    )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
