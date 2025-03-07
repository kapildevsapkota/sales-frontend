// components/Chart.js
import React, { useEffect } from "react";
import ApexCharts from "apexcharts";

const Chart = () => {
  useEffect(() => {
    const chart4Options = {
      chart: {
        type: "area",
        height: 260,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      series: [
        {
          name: "New user",
          data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 76, 85, 101],
        },
        {
          name: "Returning user",
          data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 44, 55, 57],
        },
      ],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        curve: "smooth",
        lineCap: "butt",
        colors: undefined,
        width: 2,
      },
      grid: {
        row: {
          opacity: 0,
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      yaxis: {
        show: false,
      },
      fill: {
        type: "solid",
        opacity: [0.05, 0],
      },
      colors: ["#4F46E5", "#818CF8"],
      legend: {
        position: "bottom",
        markers: {
          radius: 12,
          offsetX: -4,
        },
        itemMargin: {
          horizontal: 12,
          vertical: 20,
        },
      },
    };

    const chart4 = new ApexCharts(
      document.querySelector("#chart4"),
      chart4Options
    );
    chart4.render();

    return () => {
      chart4.destroy();
    };
  }, []);

  return <div id="chart4"></div>;
};

export default Chart;
