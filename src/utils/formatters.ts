// Format timestamp to dd/mm/yy
export const formatTimestamp = (dateString: string): string => {
  const date = new Date(dateString)
  const day = String(date.getDate()).padStart(2, "0")
  const month = String(date.getMonth() + 1).padStart(2, "0") // Months are 0-based
  const year = String(date.getFullYear()).slice(-2) // Get last two digits of the year
  return `${day}/${month}/${year}` // Format as dd/mm/yy
}
