export function getOrderStatusColor(status: string) {
  switch (status) {
    case "Returned By PicknDrop":
    case "Cancelled":
      return "bg-red-100 text-red-800";
    case "Sent to PicknDrop":
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Delivered":
      return "bg-green-100 text-green-800";
    case "Sent to Dash":
    case "Pending":
    case "Sent to YDM":
      return "bg-yellow-100 text-yellow-800";
    case "Verified":
    case "Returned By Dash":
      return "bg-purple-100 text-purple-800";
    case "Rescheduled":
    case "Return Pending":
      return "bg-orange-100 text-orange-800";
    case "Out For Delivery":
      return "bg-indigo-100 text-indigo-800";
    case "Returned By YDM":
      return "bg-rose-100 text-rose-800";
    case "Returned By Customer":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
