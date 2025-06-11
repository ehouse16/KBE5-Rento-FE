export const formatDateTime = (dateTimeStr: string): string => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  return date.toISOString().slice(0, 19).replace("T", " ");
}; 