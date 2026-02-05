import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface CalendarSelectProps {
  value?: DateRange;
  onChange?: (dateRange: DateRange) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowClear?: boolean;
  size?: 'sm' | 'md' | 'lg';
  minDate?: Date;
  maxDate?: Date;
  format?: string;
}

const CalendarSelect: React.FC<CalendarSelectProps> = ({
  value,
  onChange,
  placeholder = "Select date range",
  disabled = false,
  className = "",
  allowClear = true,
  size = 'md',
  minDate,
  maxDate,
  format = "MMM dd, yyyy"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    startDate: value?.startDate || null,
    endDate: value?.endDate || null
  });
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base'
  };

  // Update internal state when value prop changes
  useEffect(() => {
    setSelectedRange({
      startDate: value?.startDate || null,
      endDate: value?.endDate || null
    });
  }, [value]);

  // Format date helper
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return format
      .replace('MMM', new Intl.DateTimeFormat('en', { month: 'short' }).format(date))
      .replace('MM', month)
      .replace('dd', day)
      .replace('yyyy', year.toString());
  };

  // Get display text
  const getDisplayText = (): string => {
    if (!selectedRange.startDate && !selectedRange.endDate) {
      return placeholder;
    }
    
    if (selectedRange.startDate && selectedRange.endDate) {
      return `${formatDate(selectedRange.startDate)} - ${formatDate(selectedRange.endDate)}`;
    }
    
    if (selectedRange.startDate) {
      return `${formatDate(selectedRange.startDate)} - Select end date`;
    }
    
    return 'Select start date';
  };

  // Generate calendar days
  const generateCalendarDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  // Check if date is in range
  const isDateInRange = (date: Date): boolean => {
    if (!selectedRange.startDate) return false;
    
    if (selectedRange.endDate) {
      return date >= selectedRange.startDate && date <= selectedRange.endDate;
    }
    
    if (hoveredDate && selectedRange.startDate) {
      const start = selectedRange.startDate < hoveredDate ? selectedRange.startDate : hoveredDate;
      const end = selectedRange.startDate < hoveredDate ? hoveredDate : selectedRange.startDate;
      return date >= start && date <= end;
    }
    
    return false;
  };

  // Check if date is start or end date
  const isStartOrEndDate = (date: Date): boolean => {
    if (!selectedRange.startDate) return false;
    
    const isStart = date.toDateString() === selectedRange.startDate.toDateString();
    const isEnd = selectedRange.endDate && date.toDateString() === selectedRange.endDate.toDateString();
    
    return isStart || Boolean(isEnd);
  };

  // Check if date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Handle date click
  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    
    if (!selectedRange.startDate || (selectedRange.startDate && selectedRange.endDate)) {
      // Start new selection
      setSelectedRange({
        startDate: date,
        endDate: null
      });
    } else {
      // Complete selection
      if (date < selectedRange.startDate) {
        setSelectedRange({
          startDate: date,
          endDate: selectedRange.startDate
        });
      } else {
        setSelectedRange({
          startDate: selectedRange.startDate,
          endDate: date
        });
      }
    }
  };

  // Handle range selection complete
  const handleRangeComplete = () => {
    if (selectedRange.startDate && selectedRange.endDate) {
      onChange?.(selectedRange);
      setIsOpen(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setSelectedRange({ startDate: null, endDate: null });
    onChange?.({ startDate: null, endDate: null });
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), monthIndex, 1));
    setShowMonthDropdown(false);
  };

  // Handle year selection
  const handleYearSelect = (year: number) => {
    setCurrentMonth(prev => new Date(year, prev.getMonth(), 1));
    setShowYearDropdown(false);
  };

  // Generate month options
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year ± 50 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, i) => currentYear - 50 + i);

  const calendarDays = generateCalendarDays(currentMonth);
  const currentMonthName = monthOptions[currentMonth.getMonth()];
  const currentYearValue = currentMonth.getFullYear();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.calendar-select')) {
        setIsOpen(false);
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.calendar-select')) {
        setShowMonthDropdown(false);
        setShowYearDropdown(false);
      }
    };

    if (showMonthDropdown || showYearDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMonthDropdown, showYearDropdown]);

  return (
    <div className={`relative calendar-select ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between px-3 border border-gray-300 rounded-md
          bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-green-200 focus:border-green-500
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          ${sizeClasses[size]}
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span className="truncate text-left">{getDisplayText()}</span>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {allowClear && (selectedRange.startDate || selectedRange.endDate) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="w-4 h-4 rounded-full bg-gray-300 hover:bg-gray-400 flex items-center justify-center text-gray-600 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 min-w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2">
              {/* Month Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMonthDropdown(!showMonthDropdown);
                    setShowYearDropdown(false);
                  }}
                  className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded flex items-center gap-1"
                >
                  {currentMonthName}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showMonthDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showMonthDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[120px] max-h-48 overflow-y-auto">
                    {monthOptions.map((month, index) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => handleMonthSelect(index)}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                          index === currentMonth.getMonth() ? 'bg-green-50 text-green-600 font-medium' : ''
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Year Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowYearDropdown(!showYearDropdown);
                    setShowMonthDropdown(false);
                  }}
                  className="px-2 py-1 text-sm font-medium hover:bg-gray-100 rounded flex items-center gap-1"
                >
                  {currentYearValue}
                  <ChevronDown className={`w-3 h-3 transition-transform ${showYearDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showYearDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[80px] max-h-48 overflow-y-auto">
                    {yearOptions.map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-100 ${
                          year === currentYearValue ? 'bg-green-50 text-green-600 font-medium' : ''
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isDisabled = isDateDisabled(date);
              const isInRange = isDateInRange(date);
              const isStartOrEnd = isStartOrEndDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={index}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`
                    w-8 h-8 text-xs rounded-md transition-colors
                    ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${isDisabled ? 'cursor-not-allowed opacity-30' : 'cursor-pointer hover:bg-gray-100'}
                    ${isToday ? 'font-bold bg-green-50 text-green-600' : ''}
                    ${isInRange ? 'bg-green-100' : ''}
                    ${isStartOrEnd ? 'bg-green-600 text-white hover:bg-green-700' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="text-xs text-gray-500">
              {selectedRange.startDate && (
                <span>Start: {formatDate(selectedRange.startDate)}</span>
              )}
              {selectedRange.endDate && (
                <span className="ml-2">End: {formatDate(selectedRange.endDate)}</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRangeComplete}
                disabled={!selectedRange.startDate || !selectedRange.endDate}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelect;
