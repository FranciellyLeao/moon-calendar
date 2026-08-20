/**
 * Timezone & Historical Daylight Saving Time Utility
 * Converts local date + local time + IANA timezone (e.g. 'America/Sao_Paulo') -> exact UTC Date -> Julian Day
 */

export function getHistoricalUtcOffset(
  dateStr: string,
  timeStr: string,
  timeZoneName: string = 'America/Sao_Paulo'
): number {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = (timeStr || '12:00').split(':').map(Number);

    // Create a UTC date as reference
    const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));

    // Format using IANA timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZoneName,
      timeZoneName: 'shortOffset',
    });

    const parts = formatter.formatToParts(utcDate);
    const offsetPart = parts.find((p) => p.type === 'timeZoneName');

    if (offsetPart && offsetPart.value) {
      // Offset strings like "GMT-3", "GMT-2", "GMT+1", "GMT+5:30"
      const match = offsetPart.value.match(/GMT([+-]\d+)(?::(\d+))?/);
      if (match) {
        const hoursOffset = parseInt(match[1], 10);
        const minsOffset = match[2] ? parseInt(match[2], 10) / 60 : 0;
        return hoursOffset >= 0 ? hoursOffset + minsOffset : hoursOffset - minsOffset;
      }
    }
  } catch (e) {
    console.warn('Error formatting timezone offset:', e);
  }
  return -3; // Default fallback to -3 (BRT)
}
