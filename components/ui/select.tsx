import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  showIconInField?: boolean; // Show icon in the button field
  showIconInDropdown?: boolean; // Show icon in dropdown options
  iconOnlyInField?: boolean; // Show only icon in field (hide label text)
}

export function Select({ value, onChange, options, placeholder = "Select...", className, showIconInField = false, showIconInDropdown = false, iconOnlyInField = false }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "justify-between text-left font-normal min-w-[150px]",
            !selectedOption && "text-muted-foreground",
            iconOnlyInField && "justify-center",
            className
          )}
        >
          <span className={cn("truncate flex-1 min-w-0 flex items-center gap-2", iconOnlyInField && "justify-center")}>
            {showIconInField && selectedOption?.icon && (
              <span className="shrink-0">{selectedOption.icon}</span>
            )}
            {!iconOnlyInField && (selectedOption ? selectedOption.label : placeholder)}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 opacity-50", iconOnlyInField ? "ml-0" : "ml-2")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1" align="start">
        <div className="space-y-1">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-2 py-1.5 text-sm rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground min-w-0 flex items-center gap-2",
                value === option.value && "bg-accent text-accent-foreground"
              )}
            >
              {showIconInDropdown && option.icon && (
                <span className="shrink-0">{option.icon}</span>
              )}
              <span className="truncate block">{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

