<template>
  <div class="analytic_videoclip_label">
    <span>{{ data.text }} </span>
    <span v-if="data.unit"
      >({{ data.unit }} <sup style="left: -3px">{{ data.sup }}</sup
      >)</span
    >
  </div>
</template>

<script>
export default {
  props: ["data"],
};
</script>

<style>
</style>