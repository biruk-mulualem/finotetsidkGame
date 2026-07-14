// utils/dateConverter.js - COMPLETE VERSION WITH BOTH CONVERSIONS

function isValidEthiopianDate(dateStr) {
  if (!dateStr) return false;
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 13) return false;
  
  // Check day validity
  let maxDay = 30;
  if (month === 13) {
    const isLeap = (year + 1) % 4 === 0;
    maxDay = isLeap ? 6 : 5;
  }
  return day >= 1 && day <= maxDay;
}

function convertEthiopianToGregorian(dateStr) {
  if (!dateStr) return null;
  
  console.log('🔄 Converting EC date:', dateStr);
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const year = parseInt(parts[2]);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.error('Invalid date parts:', { day, month, year });
    return null;
  }
  
  if (month < 1 || month > 13) {
    console.error('Invalid month:', month);
    return null;
  }
  
  // Validate day
  let maxDay = 30;
  if (month === 13) {
    const isLeap = (year + 1) % 4 === 0;
    maxDay = isLeap ? 6 : 5;
  }
  if (day < 1 || day > maxDay) {
    console.error('Invalid day:', day, 'max:', maxDay);
    return null;
  }
  
  // Reference: Meskerem 1, 2012 EC = September 11, 2019 GC
  const refECYear = 2012;
  const refGCDate = new Date(Date.UTC(2019, 8, 11)); // September 11, 2019
  
  let totalDays = 0;
  
  // Calculate years difference
  if (year >= refECYear) {
    for (let y = refECYear; y < year; y++) {
      // Ethiopian leap year: (year + 1) % 4 === 0
      totalDays += ((y + 1) % 4 === 0) ? 366 : 365;
    }
  } else {
    for (let y = year; y < refECYear; y++) {
      totalDays -= ((y + 1) % 4 === 0) ? 366 : 365;
    }
  }
  
  // Add months
  for (let m = 1; m < month; m++) {
    if (m === 13) {
      // Pagume month
      totalDays += ((year + 1) % 4 === 0) ? 6 : 5;
    } else {
      totalDays += 30;
    }
  }
  
  // Add days
  totalDays += day - 1;
  
  // FIX: Add 1 day offset to correct the conversion
  // Meskerem 1, 1958 EC should be September 11, 1965 GC
  totalDays += 1;
  
  // Calculate Gregorian date
  const gcDate = new Date(refGCDate);
  gcDate.setUTCDate(refGCDate.getUTCDate() + totalDays);
  
  const year_num = gcDate.getUTCFullYear();
  const month_num = String(gcDate.getUTCMonth() + 1).padStart(2, '0');
  const day_num = String(gcDate.getUTCDate()).padStart(2, '0');
  
  const result = `${year_num}-${month_num}-${day_num}`;
  console.log(`✅ Converted: ${dateStr} EC → ${result} GC (days diff: ${totalDays})`);
  return result;
}

/**
 * Convert Gregorian Date to Ethiopian Calendar
 * @param {Date|string} gregorianDate - JavaScript Date object or date string
 * @returns {Object} { day, month, year } or null if invalid
 */
function convertGregorianToEthiopian(gregorianDate) {
  if (!gregorianDate) return null;
  
  // Parse if string
  let date;
  if (typeof gregorianDate === 'string') {
    date = new Date(gregorianDate);
  } else if (gregorianDate instanceof Date) {
    date = gregorianDate;
  } else {
    return null;
  }
  
  if (isNaN(date.getTime())) return null;
  
  // Ethiopian Calendar constants
  // Reference: September 11, 2019 GC = Meskerem 1, 2012 EC
  const refGCDate = new Date(Date.UTC(2019, 8, 11)); // September 11, 2019
  const refECYear = 2012;
  
  // Calculate days between reference date and target date
  const targetUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const refUTC = Date.UTC(refGCDate.getFullYear(), refGCDate.getMonth(), refGCDate.getDate());
  
  let totalDays = Math.floor((targetUTC - refUTC) / (1000 * 60 * 60 * 24));
  
  // Adjust by subtracting 1 day offset (to match the conversion)
  totalDays -= 1;
  
  // Convert days to Ethiopian calendar
  let remainingDays = totalDays;
  let ethYear = refECYear;
  
  // Handle negative days (dates before reference)
  if (remainingDays < 0) {
    // Go backwards
    while (remainingDays < 0) {
      ethYear--;
      const daysInYear = ((ethYear + 1) % 4 === 0) ? 366 : 365;
      remainingDays += daysInYear;
    }
  } else {
    // Go forwards
    while (true) {
      const daysInYear = ((ethYear + 1) % 4 === 0) ? 366 : 365;
      if (remainingDays < daysInYear) break;
      remainingDays -= daysInYear;
      ethYear++;
    }
  }
  
  // Determine month and day
  let ethMonth = 1;
  const isLeapYear = (ethYear + 1) % 4 === 0;
  const monthDays = isLeapYear ? [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 6] 
                               : [30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 5];
  
  for (let i = 0; i < monthDays.length; i++) {
    if (remainingDays < monthDays[i]) {
      ethMonth = i + 1;
      break;
    }
    remainingDays -= monthDays[i];
  }
  
  const ethDay = remainingDays + 1;
  
  return {
    day: ethDay,
    month: ethMonth,
    year: ethYear
  };
}

/**
 * Get Ethiopian month name
 * @param {number} monthNumber - 1-13
 * @param {string} language - 'am' for Amharic, 'en' for English
 * @returns {string} Month name
 */
function getEthiopianMonthName(monthNumber, language = 'am') {
  const monthNames = {
    'am': {
      1: 'መስከረም',
      2: 'ጥቅምት',
      3: 'ህዳር',
      4: 'ታህሳስ',
      5: 'ጥር',
      6: 'የካቲት',
      7: 'መጋቢት',
      8: 'ሚያዝያ',
      9: 'ግንቦት',
      10: 'ሰኔ',
      11: 'ሐምሌ',
      12: 'ነሀሴ',
      13: 'ጳጉሜ'
    },
    'en': {
      1: 'Meskerem',
      2: 'Tikimt',
      3: 'Hidar',
      4: 'Tahsas',
      5: 'Tir',
      6: 'Yekatit',
      7: 'Megabit',
      8: 'Miazia',
      9: 'Genbot',
      10: 'Sene',
      11: 'Hamle',
      12: 'Nehase',
      13: 'Pagume'
    }
  };
  
  return monthNames[language]?.[monthNumber] || monthNumber;
}

/**
 * Format Ethiopian date as string
 * @param {Object} ethDate - { day, month, year }
 * @param {string} format - 'DD/MM/YYYY' or 'DD MMM YYYY'
 * @param {string} language - 'am' or 'en'
 * @returns {string} Formatted date string
 */
function formatEthiopianDate(ethDate, format = 'DD/MM/YYYY', language = 'am') {
  if (!ethDate) return '—';
  
  const day = String(ethDate.day).padStart(2, '0');
  const month = String(ethDate.month).padStart(2, '0');
  const year = ethDate.year;
  
  if (format === 'DD/MM/YYYY') {
    return `${day}/${month}/${year}`;
  } else if (format === 'DD MMM YYYY') {
    const monthName = getEthiopianMonthName(ethDate.month, language);
    return `${day} ${monthName} ${year}`;
  }
  
  return `${day}/${month}/${year}`;
}

module.exports = {
  isValidEthiopianDate,
  convertEthiopianToGregorian,
  convertGregorianToEthiopian,
  getEthiopianMonthName,
  formatEthiopianDate
};