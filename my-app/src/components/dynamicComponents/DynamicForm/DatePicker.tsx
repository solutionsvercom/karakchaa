import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Popover } from "@radix-ui/themes";
import { CalendarIcon, ChevronUp, ChevronDown } from "lucide-react";
import "react-day-picker/dist/style.css";

interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = "Select date",
}) => {
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(value || new Date());
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentMonth.getFullYear());
  const yearScrollRef = useRef<HTMLDivElement>(null);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setOpen(false);
      setShowYearMonthPicker(false);
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const handleToday = () => {
    const today = new Date();
    onChange(today);
    setCurrentMonth(today);
    setOpen(false);
    setShowYearMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    setCurrentMonth(newDate);
    setShowYearMonthPicker(false);
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 100; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr",
    "May", "Jun", "Jul", "Aug",
    "Sep", "Oct", "Nov", "Dec",
  ];

  // Scroll to selected year when picker opens
  useEffect(() => {
    if (showYearMonthPicker && yearScrollRef.current) {
      const selectedYearElement = yearScrollRef.current.querySelector(
        `[data-year="${selectedYear}"]`
      );
      if (selectedYearElement) {
        selectedYearElement.scrollIntoView({ block: "center", behavior: "instant" });
      }
    }
  }, [showYearMonthPicker, selectedYear]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Pick a date"
          className="date-picker-trigger"
          style={{
            width: "100%",
            height: 35,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 12px",
            border: "1px solid var(--gray-a6)",
            borderRadius: 8,
            background: "var(--color-background)",
            cursor: "pointer",
            fontSize: 14,
            color: value ? "var(--gray-12)" : "var(--gray-9)",
          }}
        >
          <span>
            {value ? format(value, "dd-MMM-yyyy") : placeholder}
          </span>
          <CalendarIcon size={16} style={{ color: "var(--gray-9)" }} />
        </button>
      </Popover.Trigger>

      <Popover.Content
        side="bottom"
        align="start"
        sideOffset={6}
        collisionPadding={10}
        style={{
          background: "var(--color-panel)",
          borderRadius: 8,
          padding: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          border: "1px solid var(--gray-a6)",
          width: 120,
        }}
      >
        {/* Year/Month Picker View */}
        {showYearMonthPicker ? (
          <div>
            {/* Year Scroll */}
            <div
              ref={yearScrollRef}
              style={{
                maxHeight: 180,
                overflowY: "auto",
                marginBottom: 8,
                background: "var(--gray-a2)",
                borderRadius: 6,
                padding: 4,
              }}
            >
              {generateYears().map((year) => (
                <button
                  key={year}
                  type="button"
                  data-year={year}
                  onClick={() => handleYearSelect(year)}
                  style={{
                    width: "100%",
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: 4,
                    background:
                      year === selectedYear ? "var(--gray-a5)" : "transparent",
                    color: "var(--gray-12)",
                    cursor: "pointer",
                    fontSize: 13,
                    textAlign: "left",
                    fontWeight: year === selectedYear ? 600 : 400,
                  }}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Month Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 4,
              }}
            >
              {months.map((month, index) => (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleMonthSelect(index)}
                  style={{
                    padding: "6px",
                    border: "none",
                    borderRadius: 4,
                    background:
                      index === currentMonth.getMonth() &&
                      selectedYear === currentMonth.getFullYear()
                        ? "var(--accent-9)"
                        : "transparent",
                    color:
                      index === currentMonth.getMonth() &&
                      selectedYear === currentMonth.getFullYear()
                        ? "white"
                        : "var(--gray-12)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  {month}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Calendar View */
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setSelectedYear(currentMonth.getFullYear());
                  setShowYearMonthPicker(true);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "var(--gray-12)",
                  padding: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {format(currentMonth, "MMMM yyyy")}
                <ChevronDown size={12} />
              </button>

              <div style={{ display: "flex", gap: 2 }}>
                <button
                  type="button"
                  onClick={handlePreviousMonth}
                  aria-label="Previous month"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    color: "var(--gray-11)",
                  }}
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 2,
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    color: "var(--gray-11)",
                  }}
                >
                  <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Calendar */}
            <div className="custom-day-picker">
              <DayPicker
                mode="single"
                selected={value}
                onSelect={handleDateSelect}
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                showOutsideDays={false}
              />
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
                paddingTop: 4,
                borderTop: "1px solid var(--gray-a4)",
              }}
            >
              <button
                type="button"
                onClick={handleClear}
                style={{
                  fontSize: 10,
                  color: "var(--accent-11)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleToday}
                style={{
                  fontSize: 10,
                  color: "var(--accent-11)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Today
              </button>
            </div>
          </>
        )}
      </Popover.Content>
    </Popover.Root>
  );
};