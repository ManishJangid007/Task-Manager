import * as React from "react"
import { cn } from "@/lib/utils"

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
)

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
  weekStartsOn?: 0 | 1
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const dayNamesMo = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function Calendar({
  mode = "single",
  selected,
  onSelect,
  className,
  weekStartsOn = 1,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const date = selected || new Date()
    return new Date(date.getFullYear(), date.getMonth(), 1)
  })

  const month = currentMonth.getMonth()
  const year = currentMonth.getFullYear()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()

  const startDay = firstDayOfMonth.getDay()
  const adjustedStartDay = weekStartsOn === 1 ? (startDay === 0 ? 6 : startDay - 1) : startDay

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day)
    onSelect?.(date)
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
  }

  const days = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < adjustedStartDay; i++) {
    days.push(null)
  }
  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const displayDayNames = weekStartsOn === 1 ? dayNamesMo : dayNames

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={goToPreviousMonth}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          type="button"
        >
          <ChevronLeft />
        </button>
        <div className="text-sm font-medium text-foreground">
          {monthNames[month]} {year}
        </div>
        <button
          onClick={goToNextMonth}
          className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          type="button"
        >
          <ChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {displayDayNames.map((dayName) => (
          <div key={dayName} className="h-9 flex items-center justify-center text-xs font-medium text-muted-foreground">
            {dayName}
          </div>
        ))}
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="h-9" />
          }
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={cn(
                "h-9 w-9 rounded-md text-sm font-normal transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                isSelected(day) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                isToday(day) && !isSelected(day) && "bg-accent text-accent-foreground"
              )}
              type="button"
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
