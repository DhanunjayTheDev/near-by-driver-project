export const formatCurrency = (amount) => {
  if (amount == null) return '₹0';
  return `₹${parseFloat(amount).toFixed(2)}`;
};

export const formatDistance = (km) => {
  if (km == null) return '0 km';
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
};

export const formatDuration = (minutes) => {
  if (minutes == null) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return `${hrs}h ${mins}m`;
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateStr) => {
  return `${formatDate(dateStr)}, ${formatTime(dateStr)}`;
};

export const getTimerDisplay = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
