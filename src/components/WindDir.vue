<template>
  <div class="wind_direction_videoclip" v-if="data.length != 0">
    <div
      class="wind_direction_element"
      v-for="(e, i) in data[0].datasets"
      :key="i"
    >
      <img
        v-bind:style="{
          transform: 'rotate(' + (Number(180) + e.value) + 'deg)',
        }"
        class="wind_arrow"
        src="../assets/arrow-dir.svg"
      />
      <p class="wind_direction_card_text text-center">{{ e.text }}</p>
    </div>
  </div>
</template>

<script>
export default { props: ["data"] };
</script>

<style>
.wind_direction_videoclip {
  margin-left: 300px;
  margin-right: 105px;
  display: flex;
  justify-content: space-around;
}
.wind_direction_card {
  display: flex;
  justify-content: space-between;
  width: 195px;
  text-align: center;
  font-size: 18px;
}
.wind_direction_card_text {
  color: white;
}
.wind_arrow {
  width: 70px;
}
</style>