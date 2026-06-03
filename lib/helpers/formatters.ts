export const formatDate = (date: Date | string, locale = 'fr-FR'): string => {
  const d = new Date(date);
  return d.toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
};

export const formatTime = (date: Date | string, locale = 'fr-FR'): string => {
  const d = new Date(date);
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (date: Date | string, locale = 'fr-FR'): string => {
  return `${formatDate(date, locale)} à ${formatTime(date, locale)}`;
};

export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return 'à l\'instant';
  if (minutes < 60) return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  if (days < 7) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  if (weeks < 4) return `il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
  if (months < 12) return `il y a ${months} mois`;
  return `il y a ${years} an${years > 1 ? 's' : ''}`;
};

export const formatNumber = (num: number, locale = 'fr-FR'): string => {
  return num.toLocaleString(locale);
};

export const formatCurrency = (amount: number, currency = 'XOF', locale = 'fr-FR'): string => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

export const formatPiAmount = (amount: number): string => {
  return `${amount.toFixed(4)} π`;
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};