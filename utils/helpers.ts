/**
 * Formats a number as currency (USD)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Formats a number to a compact representation (e.g., 1.2B, 3.4M)
 */
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
};

/**
 * Generates a random sparkline data array for charts
 */
export const generateRandomSparkline = (length: number): number[] => {
  const data: number[] = [];
  let lastValue = Math.random() * 100;
  
  for (let i = 0; i < length; i++) {
    // Generate a random change between -5% and +5%
    const change = (Math.random() * 10 - 5) / 100;
    lastValue = lastValue * (1 + change);
    data.push(lastValue);
  }
  
  return data;
};

/**
 * Formats a timestamp into a readable date
 */
export const formatDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Formats a timestamp into a readable time
 */
export const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formats a percentage value with a + or - sign
 */
export const formatPercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};

/**
 * Generates a random id string
 * @returns A random string that can be used as an ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Truncates text with ellipsis if it exceeds the max length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formats a number as currency with 2 decimal places
 * @param value The number to format
 * @returns Formatted string with commas and 2 decimal places
 */
export const formatCurrencyWithTwoDecimals = (value: number): string => {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Formats a date to readable string
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDateReadable = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}; 