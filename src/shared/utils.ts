/**
 * Formats a timestamp into a relative time string in Korean.
 * @param dateStr - ISO timestamp string or null
 * @returns Korean relative time string (e.g., "방금 전", "3시간 전", "2일 전")
 */
export function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '기록 없음';
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${Math.floor(hours)}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}
