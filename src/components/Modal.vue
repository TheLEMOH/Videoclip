<template>
  <div>
    <div class="tooltip_videoclip">
      <span class="tooltiptext text-center" v-if="selectedIndicator != null">{{
        selectedIndicator.name
      }}</span>
    </div>
    <button
      type="button"
      class="btn-play"
      data-toggle="modal"
      data-target="#staticBackdrop"
    >
      <img src="../assets/wheel.svg" id="MyIMG" width="74px" height="74px" />
    </button>
    <div
      class="modal fade"
      id="staticBackdrop"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header p-0 m-0 modal_videoclip_header">
            <h5 class="modal-title p-2" id="staticBackdropLabel">
              Выбор единиц измерения
            </h5>
            <button
              type="button"
              class="modal_videoclip_close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col" v-for="i in indicators" :key="i.id">
                <button
                  class="btn btn-warning btn-lg"
                  @click="SelectIndicator(i.type, i.description)"
                  @mouseover="selectedIndicator = i"
                  data-dismiss="modal"
                >
                  {{ i.name }}
                </button>
              </div>
            </div>
            <div class="row">
              <div class="col pt-2" v-if="selectedIndicator != null">
                {{ selectedIndicator.description }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="row full">
              <div class="col">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="RememberSelection"
                    v-model="save"
                  />
                  <label
                    class="form-check-label font-weight-bold"
                    for="RememberSelection"
                    >Запомнить выбор</label
                  >
                </div>
              </div>
              <div class="col">
                <button
                  type="button"
                  class="modal_videoclip_button p-1"
                  data-dismiss="modal"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from "jquery";
export default {
  data() {
    return {
      save: false,
      selectedIndicator: null,
      indicators: [
        {
          id: 0,
          name: "PM2.5",
          type: "PM",
          description: "Концентрация взвешенных частиц в мкг/м3",
        },
        {
          id: 1,
          name: "AQI",
          type: "AQI",
          description: "Индекс качества воздуха AQI",
        },
        {
          id: 2,
          name: "ПДК",
          type: "PDK",
          description: "Доля среднесуточного ПДК (35 мкг/м3)",
        },
      ],
    };
  },
  mounted() {
    $("#MyIMG").tooltip("show");
    const remember = localStorage.getItem("KNC_VIDEOCLIP_INDICATOR");

    if (!remember) {
      $("#staticBackdrop").modal("show");
      this.selectedIndicator = this.indicators[0];
    } else {
      const indicator = this.indicators.find((i) => i.type == remember);
      this.selectedIndicator = indicator;
    }
    this.SelectIndicator(
      this.selectedIndicator.type,
      this.selectedIndicator.description
    );
  },
  methods: {
    SelectIndicator(type, description) {
      if (this.save == true)
        localStorage.setItem("KNC_VIDEOCLIP_INDICATOR", type);
      this.$emit("update-indicator", type, description);
    },
  },
};
</script>

<style>
.tooltip_videoclip {
  position: relative;
}

.tooltip_videoclip .tooltiptext {
  width: 70px;
  visibility: visible;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-radius: 6px;
  padding: 3px;
  position: absolute;
  top: 90px;
  right: 40px;
  z-index: 10;
}
</style>