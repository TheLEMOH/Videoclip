<template>
  <div id="app">
    <div class="body_videoclip">
      <Map
        class="map_videoclip"
        :layers="layers"
        :sites="receivedSites"
        :projects="selectedProjects"
        v-if="layers.length != 0"
      />
      <Control
        class="control_videoclip"
        @update-time="UpdateMap"
        @update-indicator="UpdateIndicator"
        @show-analytic="ShowAnalytic"
        @update-projects="UpdateProjets"
        :dates="dates"
        :indicator="indicator"
        :wind="receivedWind"
        :tooltips="tooltips"
        :loading="loading"
      />
      <Analytics
        :data="selectedDataForChart"
        :calm="calm"
        :dataWind="selectedDataForChartWind"
        :dataWindRose="selectedDataForRose"
        :dataWindDir3hour="selectedDataForChartWindDir3hour"
        :description="description"
        :style="{ visibility: showAnalytic == true ? 'visible' : 'hidden' }"
      />
    </div>
  </div>
</template>

<script>
import Control from "./components/Control";
import Map from "./components/Map";
import { Download } from "./scripts/Download";
import { DownloadWind } from "./scripts/Download";
import { DownloadSites } from "./scripts/Download";
import { CreateLayers } from "./scripts/Download";
import { GetData } from "./scripts/Download";
import { GetDataAllTime } from "./scripts/Download";
import { CreateDates } from "./scripts/Download";
import { CreateColoredTooltips } from "./scripts/Download";
import { CreatePDK } from "./scripts/Download";
import { DirectionToText } from "./scripts/Download";
import { DirectionRound } from "./scripts/Download";
import { AVGperHour } from "./scripts/Download";
import { CreateDataForChart } from "./scripts/Download";
import { GlueData } from "./scripts/Download";
import { CountDirections } from "./scripts/Download";
import { PercentDirection } from "./scripts/Download";
export default {
  name: "App",
  data() {
    return {
      receivedData: [],
      receivedDataHour: [],
      receivedWind: [],
      receivedSites: [],
      selectedProjects: [1, 8, 9, 12],
      selectedDataForChart: [],
      selectedDataForRose: [],
      selectedDataForChartWind: [],
      selectedDataForChartWindDir3hour: [],
      calm: [],
      savedDataforChart: [],
      savedDataforChartWind: [],
      layers: [],
      tooltips: [],
      dates: [],
      indicator: "pm",
      description: {
        text: "Концентрация взвешенных частиц",
        unit: "мкг/м",
        sup: "3",
      },
      time: "",
      loading: false,
      showAnalytic: false,
    };
  },
  components: {
    Map,
    Control,
    Analytics: () => import("./components/Analytics"),
  },
  mounted() {
    CreateDates().then((dates) => {
      this.time = dates[0];
      DownloadSites(dates, [1, 8, 9, 12]).then((data) => {
        this.receivedSites = data;
      });
      Download(dates, [1, 8, 9, 12], ["pm", "aqi", "mcp"], "1day").then(
        (data) => {
          const rememberIndicator = localStorage.getItem("air.indicator");
          if (rememberIndicator) {
            this.indicator = rememberIndicator;
          }
          this.dates = dates;
          this.receivedData = data;
          this.tooltips = CreateColoredTooltips(data, dates, this.indicator);
          const dataForLayers = GetData(data, dates[0], this.indicator);
          this.layers = CreateLayers(dataForLayers, this.indicator);
        }
      );
      DownloadWind(dates, ["temp"], "1day").then((data) => {
        /*    const windDir = GetDataAllTime(data, "dir").map((d) => {
          return DirectionToText(d.value);
        });

        const windSpeed = GetDataAllTime(data, "speed").map((d) => {
          const v = Number(d.value);
          return v.toFixed(0);
        }); */

        const temp = GetDataAllTime(data, "temp").map((d) => {
          return {
            avg: Number(d.value).toFixed(0),
            min: Number(d.min).toFixed(0),
            max: Number(d.max).toFixed(0),
          };
        });
        this.receivedWind = {
          temp,
        };
      });
      DownloadWind(dates, ["speed", "dir"], "3hour").then((data) => {
        const windSpeed = GetDataAllTime(data, "speed");
        const windDir = GetDataAllTime(data, "dir").map((d) => {
          return {
            hour: d.hour,
            value: DirectionRound(d.value),
            text: DirectionToText(d.value),
          };
        });

        this.savedDataforChart.push({
          time: 1,
          indicator: "speed",
          datasets: windSpeed,
        });

        this.savedDataforChart.push({
          time: 1,
          indicator: "dir3hour",
          datasets: windDir,
        });
      });
      DownloadWind(dates, ["speed", "dir"], "1hour").then((data) => {
        dates.forEach((d) => {
          const windSpeed = GetData(data, d, "speed");
          const windDir = GetData(data, d, "dir").map((d, index) => {
            const speed = windSpeed[index].value;
            return {
              time: d.time,
              hour: d.hour,
              speed: speed,
              value: DirectionRound(d.value),
              text: DirectionToText(d.value),
            };
          });
          const countdirections = CountDirections(windDir);
          const percentDirection = PercentDirection(countdirections);
          this.savedDataforChart.push({
            time: d,
            indicator: "dir",
            datasets: percentDirection.direction,
          });
          this.calm.push(percentDirection.calm);
          this.UpdateAnalyticWind();
        });
      });
      Download(dates, [1, 8, 9, 12], ["pm", "aqi"], "3hour").then((data) => {
        dates.forEach((d) => {
          const PM = GetData(data, d, "pm");
          const AQI = GetData(data, d, "aqi");
          const avgPM = AVGperHour(PM, "pm");
          const avgAQI = AVGperHour(AQI, "aqi");
          const PDK = CreatePDK(PM);
          const avgPDK = AVGperHour(PDK, "mcp");

          this.savedDataforChart.push({
            time: d,
            indicator: "pm",
            datasets: avgPM,
          });

          this.savedDataforChart.push({
            time: d,
            indicator: "aqi",
            datasets: avgAQI,
          });

          this.savedDataforChart.push({
            time: d,
            indicator: "mcp",
            datasets: avgPDK,
          });

          this.loading += 1;
        });
        this.UpdateAnalyticIndicators();
      });
    });
  },
  methods: {
    ShowAnalytic() {
      this.showAnalytic = !this.showAnalytic;
    },

    UpdateAnalyticIndicators() {
      const data = GetDataAllTime(this.savedDataforChart, this.indicator);
      const datasets = GlueData(data);
      const dataChart = CreateDataForChart(datasets, this.indicator);
      this.selectedDataForChart = dataChart;
    },

    UpdateAnalyticWind() {
      const dataWindSpeed = GetDataAllTime(this.savedDataforChart, "speed");
      const dataWindRose = GetDataAllTime(this.savedDataforChart, "dir");
      const dataWindDir3hour = GetDataAllTime(
        this.savedDataforChart,
        "dir3hour"
      );
      const datasetsWindSpeed = GlueData(dataWindSpeed);
      const dataChartWindSpeed = CreateDataForChart(datasetsWindSpeed, "speed");
      const dataChartWindRose = dataWindRose.map((d) => {
        return CreateDataForChart(d.datasets, "dir");
      });

      this.selectedDataForChartWind = dataChartWindSpeed;
      this.selectedDataForChartWindDir3hour = dataWindDir3hour;
      this.selectedDataForRose = dataChartWindRose;
    },

    UpdateMap(index) {
      this.time = index;
      const timeData = GetData(this.receivedData, this.time, this.indicator);
      this.layers = CreateLayers(timeData, this.indicator);
    },

    UpdateProjets(projects) {
      this.selectedProjects = projects;
    },

    UpdateIndicator(type, description) {
      this.indicator = type;
      this.description = description;
      const timeData = GetData(this.receivedData, this.time, this.indicator);
      this.layers = CreateLayers(timeData, type);
      this.tooltips = CreateColoredTooltips(
        this.receivedData,
        this.dates,
        type
      );
      this.UpdateAnalyticIndicators();
    },
  },
};
</script>

<style>
.arrow_videoclip {
  position: absolute;
  right: 140px;
  top: 200px;
  z-index: 10;
}

.arrow-leave-active {
  animation: arrow-in 3s;
}

body {
  height: 100vh;
  display: flex;
  overflow-y: hidden;
  flex-direction: column;
}

.header_videoclip {
  grid-area: header;
}

.body_videoclip {
  position: relative;
  height: 100%;
}

.map_videoclip {
  position: absolute;
  flex-grow: 1;
}

#app {
  height: 100%;
}

.control_videoclip {
  position: relative;
  height: auto;
  padding: 5px;
  background: rgba(0, 0, 0, 0.4);
  font-family: Arial, Helvetica, sans-serif;
}

.analytic_videoclip {
  position: relative;
  height: auto;
  padding: 5px;
  border-top: 1px solid grey;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-family: Arial, Helvetica, sans-serif;
}

@keyframes arrow-in {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(2);
  }
  50% {
    transform: scale(1);
  }
  75% {
    transform: scale(2);
  }
  100% {
    transform: scale(0);
  }
}

.arrow_wind_videoclip {
  display: flex;
  justify-content: space-between;
}

.vue-slider-process {
  background: white !important;
}

.btn-play {
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0);
  border: rgba(0, 0, 0, 0) !important;
}

.full {
  width: 100%;
  height: 100%;
}

.mark_videoclip_container {
  align-items: center;
  display: grid;
  height: auto;
  grid-template-columns: 190px 100px auto 100px;
}

.mark_videoclip_play {
  text-align: center;
  align-self: center;
}

.mark_videoclip_tooltips {
  align-self: center;
}

.mark_videoclip_tooltip {
  margin: 10px;
  width: 195px;
}

.mark_videoclip_tooltip_header {
  height: 25px;
}

.mark_videoclip_pause {
  text-align: center;
  align-self: center;
}

.analytic_videoclip_button {
  align-self: center;
}

.mark_videoclip_tooltip:hover {
  cursor: pointer;
  box-shadow: 0px 0px 10px 7px rgb(59, 199, 238);
  padding: 0;
}

.mark_videoclip_tooltip_active {
  box-shadow: 0px 0px 0px 10px rgb(59, 199, 238, 1);
}

.ul_videoclip {
  display: flex;
  justify-content: space-around;
}

li {
  list-style-type: none;
  white-space: nowrap;
  font-size: 18px;
  font-family: Arial, Helvetica, sans-serif;
}

.mark_videoclip_text_PM {
  font-weight: bold;
  font-size: 2.2rem;
}

.mark_videoclip_height_row {
  height: 21px;
  margin: 2px;
}

.mark_videoclip:hover {
  border: 1px solid white !important;
}

.modal_videoclip_header {
  background: #8dc8fb;
}

.modal_videoclip_close {
  border: 1px solid #c75050;
  background: #c75050;
  width: 45px;
  font-size: 20px;
  color: white;
}

.modal_videoclip_close:hover {
  border: 1px solid #a54343;
  background: #a54343;
}

.modal_videoclip_button {
  border: 1px solid silver;
  background: #e1e1e1;
  color: black;
  border-radius: 2px;
}

.modal_videoclip_button:hover {
  border: 1px solid #0078d7;
  background: #e5f1fb;
}

.ul_info_videoclip {
  margin-left: 15px;
  padding: 0px;
  width: 75px;
}

.ul_info_videoclip_wind {
  margin-left: 15px;
  padding: 0px;
}

.ul_info_videoclip_wind > li {
  height: 24px;
}

.info_videoclip_container {
  height: auto;
  display: flex;
  align-items: center;
}

span.frac {
  display: inline-block;
  font-size: 10px;
  text-align: center;
}
span.frac > sup {
  display: block;
  border-bottom: 1px solid;
  font: inherit;
}
span.frac > span {
  display: none;
}
span.frac > sub {
  display: block;
  font-size: 10px;
}

@media (max-width: 1700px) {
  li {
    font-size: 13px;
  }

  .mark_videoclip_tooltip {
    width: auto;
    height: auto;
  }
  .mark_videoclip_text_PM {
    font-size: 1.7rem;
  }
  .mark_videoclip_tooltip_header {
    height: 20px;
  }

  .mark_videoclip_height_row {
    height: 15px;
  }

  .ul_info_videoclip {
    width: 60px;
  }

  .ul_info_videoclip_wind > li {
    height: auto;
  }

  span.frac {
    display: inline-block;
    font-size: 7px;
    text-align: center;
  }

  .chart_videoclip_polar {
    width: 170px !important;
  }

  .icon_temp {
    width: 13px;
  }
}

@media (max-width: 1630px) {
  li {
    font-size: 11px;
  }

  .mark_videoclip_text_PM {
    font-size: 1.3rem;
  }

  .mark_videoclip_tooltip_header {
    height: 17px;
  }

  .ul_info_videoclip {
    width: 35px;
  }

  .chart_videoclip_polar {
    width: 150px !important;
  }

  .icon_temp {
    width: 12px;
  }
}

@media (max-width: 1450px) {
  .analytic_videoclip_label {
    width: 200px !important;
    font-size: 19px !important;
  }

  li {
    font-size: 10px;
  }

  .mark_videoclip_tooltip {
    margin: 4px;
  }

  .mark_videoclip_text_PM {
    font-size: 1rem;
  }

  .mark_videoclip_tooltip_header {
    height: 17px;
  }

  .ul_info_videoclip {
    width: 25px;
  }
  .wind_arrow {
    width: 50px;
  }

  .img_videoclip {
    width: 60px;
    height: 60px;
  }

  .mark_videoclip_button {
    width: 130px;
    font-size: 13px !important;
  }

  .mark_videoclip_container {
    grid-template-columns: 150px 80px auto 80px;
  }

  .wind_direction_videoclip {
    margin-left: 215px;
    margin-right: 75px;
  }

  .mark_videoclip_tooltip:hover {
    cursor: pointer;
    box-shadow: 0px 0px 8px 4px rgb(59, 199, 238);
    padding: 0;
  }

  .mark_videoclip_tooltip_active {
    box-shadow: 0px 0px 0px 8px rgb(59, 199, 238, 1);
  }

  .chart_videoclip_polar {
    width: 120px !important;
  }

  .icon_temp {
    width: 11px;
  }
}

@media (max-width: 1180px) {
  .analytic_videoclip_label {
    width: 165px !important;
    font-size: 15px !important;
  }

  .mark_videoclip_button {
    width: 110px;
    font-size: 11px !important;
  }

  .mark_videoclip_container {
    grid-template-columns: 120px 80px auto 80px;
  }

  .wind_arrow {
    width: 30px;
  }

  .info_videoclip_container {
    justify-content: center;
  }

  .ul_info_videoclip {
    margin: 0px;
  }

  .wind_direction_card_text {
    font-size: 10px;
  }

  .chart_videoclip_polar {
    width: 100px !important;
  }
}

@media (max-width: 970px) {
  .ul_info_videoclip_wind {
    display: none;
  }
  .analytic_videoclip_label {
    width: 160px !important;
    font-size: 15px !important;
  }

  .chart_polar_body {
    display: none !important;
  }
}
</style>
