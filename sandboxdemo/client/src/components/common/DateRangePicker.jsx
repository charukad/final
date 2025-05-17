import React, { useState, useEffect } from "react";

const DateRangePicker = ({ startDate, endDate, onChange }) => {
  const [localStartDate, setLocalStartDate] = useState("");
  const [localEndDate, setLocalEndDate] = useState("");

  // Initialize with passed values
  useEffect(() => {
    setLocalStartDate(startDate || "");
    setLocalEndDate(endDate || "");
  }, [startDate, endDate]);

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    setLocalStartDate(newDate);
    onChange(newDate, localEndDate);
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    setLocalEndDate(newDate);
    onChange(localStartDate, newDate);
  };

  // Clear date range
  const clearDates = () => {
    setLocalStartDate("");
    setLocalEndDate("");
    onChange("", "");
  };

  // Set range to last 7 days
  const setLast7Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);

    const endStr = formatDateForInput(end);
    const startStr = formatDateForInput(start);

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onChange(startStr, endStr);
  };

  // Set range to last 30 days
  const setLast30Days = () => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    const endStr = formatDateForInput(end);
    const startStr = formatDateForInput(start);

    setLocalStartDate(startStr);
    setLocalEndDate(endStr);
    onChange(startStr, endStr);
  };

  // Helper to format date for input
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="date-range-picker">
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">From</label>
          <input
            type="date"
            id="start-date"
            value={localStartDate}
            onChange={handleStartDateChange}
            max={localEndDate || undefined}
          />
        </div>

        <div className="date-input-group">
          <label htmlFor="end-date">To</label>
          <input
            type="date"
            id="end-date"
            value={localEndDate}
            onChange={handleEndDateChange}
            min={localStartDate || undefined}
            max={formatDateForInput(new Date())}
          />
        </div>
      </div>

      <div className="date-presets">
        <button className="preset-button" onClick={setLast7Days} type="button">
          Last 7 days
        </button>

        <button className="preset-button" onClick={setLast30Days} type="button">
          Last 30 days
        </button>

        <button
          className="preset-button clear"
          onClick={clearDates}
          type="button"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;
