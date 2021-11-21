<script>
import { PolarArea } from "vue-chartjs";
export default {
  props: ["data"],
  extends: PolarArea,
  data() {
    return {
      options: {
        responsive: true,
        animation: false,
        startAngle: -Math.PI / 1.75,
        legend: {
          display: false,
        },
        tooltips: {
          titleFontSize: 16,
          bodyFontSize: 16,
          zIndex: 5,
          callbacks: {
            label: (tooltipItem, data) => {
              let label = data.labels[tooltipItem.datasetIndex] || "";
              label += ": " + tooltipItem.value + "%";
              return label;
            },
          },
        },
        scale: {
          gridLines: {
            color: "grey",
            lineWidth: 1,
          },
          scaleLabel: {
            display: true,
          },
          ticks: {
            fontColor: "white",
            display: true,
            backdropColor: "rgba(0,0,0,0)",
          },
          angleLines: {
            color: "grey",
            display: true,
            lineWidth: 1,
          },
          pointLabels: {
            display: false,
          },
        },
      },
    };
  },
  mounted: function () {
    this.renderChart(this.data, this.options);
  },
  watch: {
    data: function () {
      this.renderChart(this.data, this.options);
    },
  },
};
</script>

<style>
</style>