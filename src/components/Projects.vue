<template>
  <div class="m-1" style="position: absolute; z-index: 3">
    <div class="dropdown">
      <button
        class="btn btn-secondary dropdown-toggle"
        type="button"
        id="dropdownMenuButton"
        data-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        style="background: rgba(0, 0, 0, 0.8)"
      >
        Источники данных
      </button>
      <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        <div v-for="(p, index) in projects" :key="index">
          <label :for="'videoclip_poject_' + p.id">{{ p.name }} </label>
          <input
            type="checkbox"
            :id="'videoclip_poject_' + p.id"
            :value="p.id"
            v-model="checked"
            @change="Click()"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      checked: [1, 8, 9, 12],
      projects: [
        {
          id: 1,
          name: "Министерство",
        },
        {
          id: 8,
          name: "Небо",
        },
        {
          id: 9,
          name: "КНЦ СО РАН",
        },
        {
          id: 12,
          name: "Эковизор",
        },
      ],
    };
  },
  methods: {
    Click() {
      this.$emit("update-projects", this.checked);
    },
  },
};
</script>

<style>
</style>