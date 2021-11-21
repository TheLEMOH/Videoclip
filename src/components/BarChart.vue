<script>
import { Bar } from "vue-chartjs/es/BaseCharts";
export default {
  extends: Bar,
  props: ["data", "data3hour"],
  data() {
    return {
      options: {
        animation: false,
        legend: {
          display: false,
        },
        tooltips: {
          titleFontSize: 16,
          bodyFontSize: 16,
          callbacks: {
            label: (tooltipItem, data) => {
              let label = data.datasets[tooltipItem.datasetIndex].label || "";
              let dir3hour = "";

              if (label) {
                label += ": ";
              }
              label += tooltipItem.yLabel;

              if (this.data3hour) {
                dir3hour += "Направление: ";
                dir3hour += this.data3hour[0].datasets[tooltipItem.index].text;
                const text = [label, dir3hour];
                return text;
              } else {
                const text = [label];
                return text;
              }
            },
          },
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "white",
                fontSize: "16",
                autoSkip: false,
                maxRotation: 0,
                callback: (value) => {
                  if (
                    value != "03:00" &&
                    value != "06:00" &&
                    value != "09:00" &&
                    value != "15:00" &&
                    value != "18:00" &&
                    value != "21:00"
                  ) {
                    return value;
                  }
                },
              },
              gridLines: {
                color: "grey",
                lineWidth: 1,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "white",
                fontSize: "16",
                stepSize: 5,
              },
              gridLines: {
                color: "grey",
                lineWidth: 1,
              },
            },
          ],
        },

        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },

  mounted() {
    window.addEventListener("resize", this.handleResize);
    this.handleResize();
  },

  methods: {
    handleResize() {
      if (window.innerWidth < 1400) {
        this.options.scales.xAxes[0].ticks.maxRotation = 45;
        this.options.scales.xAxes[0].ticks.fontSize = 14;
        this.options.scales.yAxes[0].ticks.fontSize = 14;
      } else {
        this.options.scales.xAxes[0].ticks.maxRotation = 0;
        this.options.scales.xAxes[0].ticks.fontSize = 16;
        this.options.scales.yAxes[0].ticks.fontSize = 16;
      }

      this.renderChart(this.data, this.options);
    },
  },

  watch: {
    data: function () {
      if (this.data.length != 0) {
        const minimum = 0;
        const maxFromData = Math.max.apply(null, this.data.datasets[0].data);
        const percent = (maxFromData * 20) / 100;
        let maximum = 0;
        if (
          this.data.indicator == "pm" ||
          this.data.indicator == "aqi" ||
          this.data.indicator == "speed"
        ) {
          maximum = Math.ceil(maxFromData + percent);
        } else {
          maximum = Math.ceil((maxFromData + percent) * 10) / 10;
        }

        if (this.data.indicator == "pm") {
          this.options.scales.yAxes[0].ticks.stepSize = 5;
        }
        if (this.data.indicator == "aqi") {
          this.options.scales.yAxes[0].ticks.stepSize = 10;
        }
        if (this.data.indicator == "mcp") {
          this.options.scales.yAxes[0].ticks.stepSize = 0.1;
        }
        if (this.data.indicator == "speed") {
          this.options.scales.yAxes[0].ticks.stepSize = 1;
        }

        this.options.scales.yAxes[0].ticks.min = minimum;
        this.options.scales.yAxes[0].ticks.max = maximum;
        this.renderChart(this.data, this.options);
      }
    },
  },
};
</script>