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
              size: 120mm 80mm landscape; /* Landscape: width 120mm, height 80mm */
              margin: 0;
            }
            body {
              width: 120mm;
              height: 80mm;
              margin: 0;
              padding: 0;
            }
            .order {
              page-break-after: always;
            }
            .order:last-child {
              page-break-after: auto;
            }
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            width: 120mm;
            height: 80mm;
            margin: 0;
            padding: 0;
          }
          .header {
            text-align: center;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .order {
            border: 1px dashed #000;
            padding: 8px 5px;
            margin: 0;
            min-width: 120mm;
            min-height: 80mm;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
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
        <div class="header">
          <h2>Baliyo Venture</h2>
          <p>Processing Orders</p>
        </div>
        ${processingOrders
          .map(
            (order, idx) => `
          <div class="order" style="${
            idx === processingOrders.length - 1
              ? "page-break-after: auto;"
              : "page-break-after: always;"
          }">
            <div class="order-header">
              Order #: ${order.id}<br>
              Date: ${new Date(order.created_at).toLocaleDateString()}<br>
              Time: ${new Date(order.created_at).toLocaleTimeString()}
            </div>
            <div class="order-details">
              Customer: ${order.full_name}<br>
              Phone: ${order.phone_number}<br>
              Address: ${order.delivery_address}, ${order.city}<br>
              Payment: ${order.payment_method}<br>
              Delivery: ${order.delivery_type}
            </div>
            <div class="order-items">
              ${order.order_products
                .map(
                  (item) => `
                ${item.quantity}x ${item.product.name} - Rs.${
                    (item.quantity * Number(order.total_amount)) /
                    order.order_products.reduce((sum, p) => sum + p.quantity, 0)
                  }
              `
                )
                .join("<br>")}
            </div>
            <div class="order-total">
              Total: Rs.${order.total_amount}
            </div>
          </div>
        `
          )
          .join("")}
        <div class="footer">
          Printed on: ${new Date().toLocaleString()}
        </div>
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
