<template>
  <vl-map ref="map" :controls="false" @pointermove="onMapPointerMove">
    <vl-view
      :zoom="zoom"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :center="center"
      :projection="projection"
    ></vl-view>
    <vl-layer-tile>
      <vl-source-wms
        layer-name="layerName"
        :url="url"
        :attributions="attributions"
        :layers="layer"
        :format="format"
        :version="version"
        :projection="projection"
        :resolutions="resolutions"
        :tileGrid="tileGrid"
        :extent="extent"
        :zIndex="1"
      ></vl-source-wms>
    </vl-layer-tile>

    <vl-layer-vector v-for="(feature, index) in features" :key="index">
      <vl-source-vector
        ref="gjsource"
        :features="feature.features"
        :projection="projection"
        :extent="extent"
      ></vl-source-vector>
      <vl-style-func :factory="pointsStyleFunc" />
    </vl-layer-vector>

    <vl-overlay
      v-if="currentPosition"
      :position="currentPosition"
      :projection="projection"
      :extent="extent"
      :auto-pan="true"
    >
      <template>
        <div class="overlay_videoclip">{{ text }}</div>
      </template>
    </vl-overlay>
  </vl-map>
</template>

<script>
import { Fill, Style, Circle, Text, Stroke, RegularShape } from "ol/style";
import * as olExt from "vuelayers/lib/ol-ext";
import { DivideLayers } from "../scripts/Download";
/*  import { register } from "ol/proj/proj4"; */
import proj4 from "proj4";
proj4.defs("EPSG:4326");
proj4.defs(
  "EPSG:28416",
  "+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +ellps=krass +towgs84=23.92,-141.27,-80.9,-0,0.35,0.82,-0.12 +units=m +no_defs"
);
const map = {
  extent: [11385622.915, 2840622.915, 21404377.085, 12859377.085],
  resolutions: [
    39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125,
    2445.9849047851562, 1222.9924523925781, 611.4962261962891,
    305.74811309814453, 152.87405654907226, 76.43702827453613,
    38.218514137268066, 19.109257068634033, 9.554628534317017,
    4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135,
  ],
  proj: "EPSG:28416",
  projText:
    "+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +ellps=krass +towgs84=23.92,-141.27,-80.9,-0,0.35,0.82,-0.12 +units=m +no_defs",
};

let proj = olExt.createProj({
  code: map.proj,
  extent: map.extent,
  units: "m",
});

olExt.addProj(proj);

export default {
  props: ["layers", "sites", "projects"],
  data() {
    return {
      show: true,
      currentPosition: undefined,
      text: "",
      zoom: 10.5,
      maxZoom: 15,
      minZoom: 9.5,
      center: proj4("EPSG:4326", "EPSG:28416", [92.886, 56.038]),
      rotation: 0,
      extent: map.extent,
      projection: proj.getCode(),
      layer: "egis_gk_light",
      format: "image/png",
      version: "1.1.1",
      tileGrid: {
        extent: map.extent,
        resolutions: map.resolutions,
      },
      resolutions: map.resolutions,
      crossOrigin: "anonymous",
      url: "http://map{1-4}.24bpd.ru/geowebcache/service/wms?",
      attributions: [
        '© <a href="http://24bpd.ru/" target="_blank">Енисей-ГИС</a>',
      ],
    };
  },
  methods: {
    /*  ClickMap(e) {
      const map = this.$refs.map;
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
      if (feature) {
        console.log(feature);
      }
    }, */
    onMapPointerMove(e) {
      const map = this.$refs.map;
      const feature = map.forEachFeatureAtPixel(e.pixel, (feature) => feature);
      if (feature) {
        const id = feature.getId();
        const site = this.sites.find((s) => {
          if (s.id == id) return s;
        });
        const coordinate = feature.getGeometry().getCoordinates();
        this.currentPosition = coordinate;
        this.text = site.name;
      } else {
        this.currentPosition = undefined;
      }
    },
    pointsStyleFunc() {
      return (feature) => {
        const project = feature.get("project");
        let baseStyle = null;
        if (project == 9) {
          baseStyle = new Circle({
            opacity: 0,
            radius: feature.get("radius"),
            fill: new Fill({
              color: feature.get("color"),
            }),
            stroke: new Stroke(feature.get("stroke")),
          });
        }

        if (project == 1) {
          baseStyle = new RegularShape({
            opacity: 0,
            radius: feature.get("radius"),
            fill: new Fill({
              color: feature.get("color"),
            }),
            points: 5,
            stroke: new Stroke(feature.get("stroke")),
          });
        }

        if (project == 12) {
          baseStyle = new RegularShape({
            fill: new Fill({
              color: feature.get("color"),
            }),
            stroke: new Stroke(feature.get("stroke")),
            points: 4,
            radius: feature.get("radius") + 5,
          });
        }

        if (project == 8) {
          baseStyle = new RegularShape({
            fill: new Fill({
              color: feature.get("color"),
            }),
            stroke: new Stroke(feature.get("stroke")),
            points: 4,
            radius: feature.get("radius") + 5,
            angle: Math.PI / 4,
          });
        }

        const verticiesStyle = new Style({
          image: baseStyle,
          text: new Text({
            font: feature.get("font"),
            text: feature.get("value"),
            fill: new Fill({
              color: feature.get("fontColor"),
            }),
          }),
        });
        return [verticiesStyle];
      };
    },
  },
  computed: {
    features: function () {
      const layers = this.layers.map((l) => {
        return {
          type: "Feature",
          id: l.id,
          geometry: {
            type: "Point",
            coordinates: l.coordinates,
          },
          properties: {
            project: l.project,
            radius: l.radius,
            font: l.font,
            value: l.value,
            fontColor: l.text,
            color: l.fill,
            stroke: l.stroke,
          },
        };
      });
      const result = DivideLayers(layers, this.projects);
      return result;
    },
  },
};
</script>

<style>
.overlay_videoclip {
  opacity: 0.8;
  padding: 5px;
  position: absolute;
  background: grey;
  width: auto;
  white-space: nowrap;
  color: white;
  text-align: center;
  border-radius: 6px;
  top: -30px;
  left: 30px;
}
</style>