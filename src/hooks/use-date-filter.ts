import { useState, useCallback } from 'react';

export const useDateFilter = (initialMonth?: string) => {
  const [selectedMonth, setSelectedMonth] = useState&lt;string | null&gt;(
    initialMonth || new Date().toISOString().slice(0, 7)
  );

  const changeMonth = useCallback((month: string | null) => {
    setSelectedMonth(month);
  }, []);

  const isInSelectedMonth = useCallback(
    (date: string) => {
      if (!selectedMonth || !date) return false;
      return date.startsWith(selectedMonth);
    },
    [selectedMonth]
  );

  return {
    selectedMonth,
    changeMonth,
    isInSelectedMonth,
  };
};

export const useMonthNavigation = (initialMonth?: string) => {
  const [currentMonth, setCurrentMonth] = useState(
    initialMonth || new Date().toISOString().slice(0, 7)
  );

  const nextMonth = useCallback(() => {
    setCurrentMonth((current) => {
      const [year, month] = current.split('-');
      const date = new Date(Number(year), Number(month), 1);
      date.setMonth(date.getMonth());
      return date.toISOString().slice(0, 7);
    });
  }, []);

  const previousMonth = useCallback(() => {
    setCurrentMonth((current) => {
      const [year, month] = current.split('-');
      const date = new Date(Number(year), Number(month) - 2, 1);
      return date.toISOString().slice(0, 7);
    });
  }, []);

  return {
    currentMonth,
    setCurrentMonth,
    nextMonth,
    previousMonth,
  };
};