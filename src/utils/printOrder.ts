import { SaleItem } from "@/types/sale";

interface PrintOrderOptions {
  orders: SaleItem[];
}

export const printOrders = async ({ orders }: PrintOrderOptions) => {
  // Filter only processing orders
  const processingOrders = orders.filter(
    (order) => order.order_status === "Processing"
  );

  // Create print content
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Print Orders</title>
        <style>
          @media print {
            @page {
              size: 4.2in 3in; /* Set width for thermal printer, height is auto */
              margin: 0.5in 0.2in; /* Add margins: top/bottom 0.5in, left/right 0.2in */
            }
            body {
              width: 4.2in; /* Match body width to printer width */
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 10px; /* Smaller font for receipt */
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .order {
              width: 100%; /* Use full width */
              padding: 2px 5px; /* Reduced padding */
              margin: 0 auto; /* Center the order horizontally */
              box-sizing: border-box;
              page-break-after: always;
              border-bottom: 1px dashed #000; /* Separator between orders */
              max-width: 3.8in; /* Slightly less than page width for better appearance */
            }
            .order:last-child {
              page-break-after: auto;
              border-bottom: none;
            }
            .order-details,
            .order-items,
            .order-total {
              margin-bottom: 2px; /* Reduced spacing */
            }
            .order-header {
              font-weight: bold;
              margin-bottom: 2px; /* Reduced spacing */
            }
            .order-items div {
              margin-bottom: 0; /* Remove spacing between items */
            }
            .order-total {
              text-align: right;
              font-weight: bold;
              margin-top: 5px; /* Add a little space above total */
            }
             .footer {
            text-align: center;
            margin-top: 5px; /* Reduced footer margin */
            font-size: 8px; /* Smaller footer font */
          }
          }
          /* Styles for screen view (optional, adjust as needed) */
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            width: 3in; /* Keep original width for screen view if desired */
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .order {
            border: 1px dashed #000;
            padding: 8px 5px 0 5px;
            margin: 0 0 10px 0; /* Add margin bottom for screen view separation */
            box-sizing: border-box;
          }
          .order-header {
            font-weight: bold;
            margin-bottom: 5px;
          }
          .order-details {
            margin-bottom: 5px;
          }
          .order-items {
            margin: 5px 0;
          }
          .order-total {
            text-align: right;
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 10px;
            font-size: 10px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
      
        ${processingOrders
          .map(
            (order, idx) => `
          <div class="order">
            <div class="order-header">
              Order #: ${order.id}<br>
              Date: ${new Date(order.created_at).toLocaleDateString()}
            </div>
            <div class="order-details">
              Customer: <span style="font-weight: bold;">${
                order.full_name
              }</span><br>
              Phone: <span style="font-weight: bold;">${
                order.phone_number
              }</span><br>
              Address: <span style="font-weight: bold;">${
                order.delivery_address
              }</span>, ${order.city}<br>
              Payment: <span style="font-weight: bold;">${
                order.payment_method
              }</span>
            </div>
            <div class="order-items">
              ${order.order_products
                .map((item) => {
                  let productName = item.product.name.toLowerCase();
                  let displayName = item.product.name;
                  if (
                    productName.includes("dandruff") &&
                    productName.includes("oil")
                  ) {
                    displayName = "D-Oil";
                  } else if (
                    productName.includes("hairfall") &&
                    productName.includes("oil")
                  ) {
                    displayName = "H-Oil";
                  } else if (
                    productName.includes("baldness") &&
                    productName.includes("oil")
                  ) {
                    displayName = "B-Oil";
                  } else if (
                    productName.includes("shampoo") &&
                    productName.includes("bottle")
                  ) {
                    displayName = "SB";
                  } else if (
                    productName.includes("shampoo") &&
                    productName.includes("sachet")
                  ) {
                    displayName = "SS";
                  }
                  return `<div>${item.quantity}x ${displayName} - Rs.${
                    (item.quantity * Number(order.total_amount)) /
                    order.order_products.reduce((sum, p) => sum + p.quantity, 0)
                  }</div>`;
                })
                .join("")}
            </div>
            <div class="order-total">
              Total: Rs.${order.total_amount}
            </div>
          </div>
        `
          )
          .join("")}
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()">Print</button>
        </div>
      </body>
    </html>
  `;

  // Create a new window for printing
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    throw new Error("Failed to open print window");
  }

  // Write content to the window
  printWindow.document.write(printContent);
  printWindow.document.close();

  // Wait for content to load
  printWindow.onload = () => {
    // User clicks print button for best compatibility
  };
};
