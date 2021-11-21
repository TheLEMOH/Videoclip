<template>
  <div class="mark_videoclip_container">
    <div class="mark_videoclip_buttons m-2">
      <div class="dropdown" style="z-index: 100">
        <button
          class="btn dropdown-toggle mark_videoclip_button text-left"
          id="dropdownMenuIndicators"
          data-toggle="dropdown"
        >
          {{ indicator }}
          <div class="dropdown-menu" aria-labelledby="dropdownMenuIndicators">
            <h6 class="m-1 font-weight-bold">Показатели</h6>
            <button
              v-for="(i, index) in indicators"
              :key="index"
              class="dropdown-item"
              @click="UpdateIndicator(i.type, i.description, i.name)"
            >
              {{ i.name }}
            </button>
          </div>
        </button>
      </div>
      <div class="dropdown">
        <button
          class="btn dropdown-toggle mark_videoclip_button text-left"
          id="dropdownMenuProjects"
          data-toggle="dropdown"
        >
          Все источники
        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuProjects">
          <h6 class="m-1 font-weight-bold">Источники данных</h6>
          <div
            v-for="(p, index) in projects"
            :key="index"
            class="dropdown-item"
          >
            <input
              class="mr-2"
              :id="'videoclip_poject_' + p.id"
              type="checkbox"
              :value="p.id"
              v-model="selectedProject"
              @change="UpdateProject"
            />
            <label :for="'videoclip_poject_' + p.id" style="width: 100%">{{
              p.name
            }}</label>
          </div>
        </div>
      </div>
    </div>
    <div class="mark_videoclip_play">
      <button class="btn-play" @click="Action">
        <img
          class="img_videoclip"
          src="../assets/play.svg"
          v-if="play == false"
        />
        <img src="../assets/pause.svg" class="img_videoclip" v-else />
      </button>
    </div>
    <div class="mark_videoclip_tooltips">
      <ul class="ul_videoclip w-100 p-0 m-0">
        <li
          v-for="(tooltip, index) in tooltips"
          :key="index"
          @click="Active(index)"
        >
          <div
            class="card mark_videoclip_tooltip"
            :class="{
              mark_videoclip_tooltip_active: index == activeElement,
            }"
            :style="{
              background: tooltip.color,
              color: tooltip.text,
            }"
          >
            <div
              class="
                card-header
                mark_videoclip_tooltip_header
                p-0
                m-0
                text-center
              "
              :style="{
                background: LightenDarkenColor(-0.3, tooltip.color),
                color: tooltip.text,
              }"
            >
              <span>{{ Formater(dates[index]) }}</span>
            </div>
            <div class="card-body p-1 m-0">
              <div class="info_videoclip_container">
                <ul class="ul_info_videoclip text-center">
                  <li>
                    <span class="mark_videoclip_text_PM">{{
                      tooltip.value
                    }}</span>
                  </li>
                </ul>
                <ul class="ul_info_videoclip_wind" v-if="wind.length != 0">
                  <li class="d-flex" style="align-items: center">
                    <Sun class="icon_temp mr-1" :color="tooltip.text" />
                    <span>{{ wind.temp[index].max }}°C</span>
                  </li>
                  <li class="d-flex" style="align-items: center">
                    <Moon class="icon_temp mr-1" :color="tooltip.text" />
                    <span>{{ wind.temp[index].min }}°C</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!--   <div class="mark_videoclip_pause">
      <Modal @update-indicator="UpdateIndicator" />
    </div> -->
    <div class="analytic_videoclip_button text-center">
      <img
        v-if="loading == 7"
        @click="ShowAnalytic"
        class="img_videoclip"
        src="../assets/bar-chart.svg"
      />
      <img
        v-if="loading != 7"
        class="img_videoclip"
        src="../assets/rolling.svg"
      />
    </div>
  </div>
</template>

<script>
import { DateToText } from "../scripts/Download";
import Sun from "./Sun.vue";
import Moon from "./Moon.vue";
export default {
  props: ["dates", "tooltips", "wind", "loading"],
  components: {
    Sun,
    Moon,
  },
  data() {
    return {
      selectedIndex: 0,
      selectedProject: [],
      indicator: "PM2.5",
      min: 0,
      max: 7,
      text: "Play",
      play: false,
      t: [],
      activeElement: 0,
      indicators: [
        {
          name: "PM2.5",
          type: "pm",
          description: {
            text: "Концентрация взвешенных частиц",
            unit: "мкг/м",
            sup: "3",
          },
        },
        {
          name: "AQI",
          type: "aqi",
          description: {
            text: "Индекс качества воздуха AQI",
            sup: "",
            units: "",
          },
        },
        {
          name: "ПДКсс",
          type: "mcp",
          description: {
            text: "Доля среднесуточного ПДК",
            sup: "3",
            unit: "= 35 мкг/м",
          },
        },
      ],
      projects: [
        {
          id: 9,
          name: "КНЦ",
        },
        {
          id: 1,
          name: "Министерство",
        },
        {
          id: 8,
          name: "Nebo",
        },
        {
          id: 12,
          name: "Эковизор",
        },
      ],
    };
  },
  mounted() {
    let rememberIndicator = localStorage.getItem("air.indicator");
    if (!rememberIndicator) rememberIndicator = "pm";
    const i = this.indicators.find((e) => {
      if (e.type == rememberIndicator) return e;
    });
    if (i) {
      this.UpdateIndicator(i.type, i.description, i.name);
    } else
      this.UpdateIndicator(
        this.indicators[0].type,
        this.indicators[0].description,
        this.indicators[0].name
      );
    const rememberProjects = localStorage.getItem("air.projects");
    if (rememberProjects) {
      const splitProjects = rememberProjects.split(",");
      this.selectedProject = splitProjects;
    } else {
      this.selectedProject = [1, 8, 9, 12];
    }

    this.UpdateProject();
    document.addEventListener("keydown", (e) => {
      this.Key(e);
    });
  },
  methods: {
    Key(e) {
      if (e.code == "ArrowLeft" || e.code == "ArrowDown") {
        this.ArrowLeft();
      }
      if (e.code == "ArrowRight" || e.code == "ArrowUp") {
        this.ArrowRight();
      }
    },
    ArrowLeft() {
      if (this.activeElement > 0) {
        this.activeElement -= 1;
        this.selectedIndex = this.dates[this.activeElement];
        this.Pause();
        this.UpdateTime();
      }
    },
    ArrowRight() {
      if (this.activeElement < 6) {
        this.activeElement += 1;
        this.selectedIndex = this.dates[this.activeElement];
        this.Pause();
        this.UpdateTime();
      }
    },
    ShowAnalytic() {
      this.$emit("show-analytic");
    },
    UpdateTime() {
      this.$emit("update-time", this.selectedIndex, this.play);
    },
    UpdateIndicator(type, description, name) {
      localStorage.setItem("air.indicator", type);
      this.Pause();
      this.indicator = name;
      this.$emit("update-indicator", type, description);
    },
    UpdateProject() {
      localStorage.setItem("air.projects", this.selectedProject);
      this.$emit("update-projects", this.selectedProject);
    },
    Play() {
      const step = 2000;
      this.text = "Pause";
      this.UpdateTime();
      this.activeElement = 0;
      for (let i = this.activeElement; i < this.max; i++) {
        this.t.push(
          setTimeout(() => {
            if (this.play) {
              this.activeElement = i;
              this.selectedIndex = this.dates[i];
              this.UpdateTime();
            }
            if (i == this.max - 1) {
              this.Pause();
            }
          }, i * step)
        );
      }
    },
    Pause() {
      this.play = false;
      this.t.forEach((e) => {
        clearTimeout(e);
      });
      this.text = "Play";
    },
    Action() {
      this.play = !this.play;
      if (this.play) {
        this.Play();
      } else {
        this.Pause();
      }
    },
    Formater(date) {
      return DateToText(date);
    },
    LightenDarkenColor(p, c0, c1, l) {
      let r,
        g,
        b,
        P,
        f,
        t,
        h,
        i = parseInt,
        m = Math.round,
        a = typeof c1 == "string";
      if (
        typeof p != "number" ||
        p < -1 ||
        p > 1 ||
        typeof c0 != "string" ||
        (c0[0] != "r" && c0[0] != "#") ||
        (c1 && !a)
      )
        return null;
      if (!this.pSBCr)
        this.pSBCr = (d) => {
          let n = d.length,
            x = {};
          if (n > 9) {
            ([r, g, b, a] = d = d.split(",")), (n = d.length);
            if (n < 3 || n > 4) return null;
            (x.r = i(r[3] == "a" ? r.slice(5) : r.slice(4))),
              (x.g = i(g)),
              (x.b = i(b)),
              (x.a = a ? parseFloat(a) : -1);
          } else {
            if (n == 8 || n == 6 || n < 4) return null;
            if (n < 6)
              d =
                "#" +
                d[1] +
                d[1] +
                d[2] +
                d[2] +
                d[3] +
                d[3] +
                (n > 4 ? d[4] + d[4] : "");
            d = i(d.slice(1), 16);
            if (n == 9 || n == 5)
              (x.r = (d >> 24) & 255),
                (x.g = (d >> 16) & 255),
                (x.b = (d >> 8) & 255),
                (x.a = m((d & 255) / 0.255) / 1000);
            else
              (x.r = d >> 16),
                (x.g = (d >> 8) & 255),
                (x.b = d & 255),
                (x.a = -1);
          }
          return x;
        };
      (h = c0.length > 9),
        (h = a ? (c1.length > 9 ? true : c1 == "c" ? !h : false) : h),
        (f = this.pSBCr(c0)),
        (P = p < 0),
        (t =
          c1 && c1 != "c"
            ? this.pSBCr(c1)
            : P
            ? { r: 0, g: 0, b: 0, a: -1 }
            : { r: 255, g: 255, b: 255, a: -1 }),
        (p = P ? p * -1 : p),
        (P = 1 - p);
      if (!f || !t) return null;
      if (l)
        (r = m(P * f.r + p * t.r)),
          (g = m(P * f.g + p * t.g)),
          (b = m(P * f.b + p * t.b));
      else
        (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)),
          (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)),
          (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
      (a = f.a),
        (t = t.a),
        (f = a >= 0 || t >= 0),
        (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
      if (h)
        return (
          "rgb" +
          (f ? "a(" : "(") +
          r +
          "," +
          g +
          "," +
          b +
          (f ? "," + m(a * 1000) / 1000 : "") +
          ")"
        );
      else
        return (
          "#" +
          (
            4294967296 +
            r * 16777216 +
            g * 65536 +
            b * 256 +
            (f ? m(a * 255) : 0)
          )
            .toString(16)
            .slice(1, f ? undefined : -2)
        );
    },
    Active(i) {
      this.selectedIndex = this.dates[i];
      this.activeElement = i;
      this.Pause();
      this.UpdateTime();
    },
  },
};
</script>

<style>
.img_videoclip {
  width: 74px;
  height: 74px;
}

.mark_videoclip_button {
  font-size: 16px !important;
  color: white !important;
  margin: 2px;
  opacity: 1;
  background: #055a81 !important;
  width: 170px;
}
</style>