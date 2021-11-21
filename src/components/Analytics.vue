<template>
  <div class="analytic_videoclip">
    <div class="analytic_videoclip_body">
      <div class="analytic_videoclip_label">
        <Description :data="description" />
      </div>
      <div class="analytic_videoclip_element">
        <BarChart class="chart_videoclip" :data="data" v-if="data" />
      </div>
    </div>
    <div class="analytic_videoclip_body mt-4">
      <div class="analytic_videoclip_label">Скорость ветра (м/с)</div>
      <div class="analytic_videoclip_element">
        <BarChart
          class="chart_videoclip"
          :data="dataWind"
          :data3hour="dataWindDir3hour"
          v-if="dataWind"
        />
      </div>
    </div>

    <div class="analytic_videoclip_body chart_polar_body">
      <div class="analytic_videoclip_label">
        Роза ветров (повторяемость направлений ветра %)
      </div>
      <div
        class="d-flex flex-column justify-content-center align-items-center"
        v-for="(d, index) in dataWindRose"
        :key="index"
      >
        <PolarChart class="chart_videoclip_polar" :data="d" />
        <span class="mt-2">Штиль: {{ calm[index] }}%</span>
      </div>
    </div>
  </div>
</template>


<script>
import BarChart from "./BarChart";
import PolarChart from "./PolarChart";
import Description from "./Description";
export default {
  props: [
    "data",
    "calm",
    "dataWind",
    "dataWindRose",
    "description",
    "loading",
    "dataWindDir3hour",
  ],
  components: {
    BarChart,
    PolarChart,
    Description,
  },
};
</script>

<style>
.analytic_videoclip_body {
  margin-right: 100px;
  display: flex;
  justify-content: space-around;
}
.analytic_videoclip_label {
  padding: 5px;
  flex-shrink: 0;
  width: 265px;
  font-size: 20px;
}
.analytic_videoclip_element {
  width: 100%;
  height: 230px;
}
.chart_videoclip {
  height: 230px;
}
.chart_videoclip_polar {
  width: 200px;
}
</style>