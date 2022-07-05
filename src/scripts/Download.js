/* Регисстрация проекций */
import proj4 from "proj4";
proj4.defs("EPSG:3857");
proj4.defs("EPSG:4326");
proj4.defs("EPSG:28416", "+proj=tmerc +lat_0=0 +lon_0=93 +k=1 +x_0=16500000 +y_0=0 +ellps=krass +towgs84=23.92,-141.27,-80.9,-0,0.35,0.82,-0.12 +units=m +no_defs");
/* Классы */
const PM_RANGE = [0, 25, 35, 160, Infinity];
const AQI_RANGE = [0, 50, 100, 150, 200, 300, 500, Infinity];
const PDK_RANGE = [0, 1, Infinity];
const SPEED_RANGE = [0, 2, 4, 7, Infinity]
const DIR_RANGE = [0, 2, 4, 7, Infinity]

/* Зеленый,Салатовый,Желтый,Красный
 */

const RANGES = {
    pm: PM_RANGE,
    aqi: AQI_RANGE,
    mcp: PDK_RANGE,
    speed: SPEED_RANGE,
    dir: DIR_RANGE
};

/* Буквенные коды в числовые */
const CODES = {
    pm: 348,
    aqi: 355,
    mcp: 371,
    temp: 103,
    dir: 101,
    speed: 102,
};

const TEXT = {
        pm: "PM",
        aqi: "AQI",
        mcp: "ПДК",
        temp: "Температура",
        dir: "Направление ветра",
        speed: "Скорость ветра",
    }
    /* Преобразование значений */
const CONVERSION = {
    pm: 1000,
    aqi: 1,
    mcp: 1,
    temp: 1
};

/*  */
const DIR_TEXT = [
    "С",
    "ССВ",
    "СВ",
    "ВСВ",
    "В",
    "ВЮВ",
    "ЮВ",
    "ЮЮВ",
    "Ю",
    "ЮЮЗ",
    "ЮЗ",
    "ЗЮЗ",
    "З",
    "ЗСЗ",
    "СЗ",
    "ССЗ",
];

/* Цветовые схемы */
const COLORS_PM = [
    { color: 'rgb(0,153,102)', text: "rgb(250,250,250)" },
    { color: 'rgb(178, 223, 138)', text: "rgb(0,0,0)" },
    { color: 'rgb(255,222,51)', text: "rgb(0,0,0)" },
    { color: 'rgb(204,0,51)', text: "rgb(250,250,250)" },
];

const COLORS_AQI = [
    { color: 'rgb(0,153,102)', text: "rgb(250,250,250)" },
    { color: 'rgb(255,222,51)', text: "rgb(0,0,0)" },
    { color: 'rgb(255,153,51)', text: "rgb(250,250,250)" },
    { color: 'rgb(204,0,51)', text: "rgb(250,250,250)" },
    { color: 'rgb(102,0,153)', text: "rgb(250,250,250)" },
    { color: 'rgb(126,0,35)', text: "rgb(250,250,250)" },
    { color: 'rgb(0,0,0)', text: "rgb(250,250,250)" }
];

const COLORS_PDK = [
    { color: 'rgb(0,153,102)', text: "rgb(250,250,250)" },
    { color: 'rgb(204,0,51)', text: "rgb(250,250,250)" }
];

const COLORS_SPEED = [
    { color: 'rgb(145, 238, 255)' },
    { color: 'rgb(2, 188, 237)' },
    { color: 'rgb(0, 136, 219)' },
    { color: 'rgb(0, 82, 189)' },
    { color: 'rgb(4, 13, 140)' },
]

const COLORS_DIR = [
    { color: 'rgb(145, 238, 255)' },
    { color: 'rgb(2, 188, 237)' },
    { color: 'rgb(0, 136, 219)' },
    { color: 'rgb(0, 82, 189)' },
    { color: 'rgb(4, 13, 140)' },
]

const COLORS = {
    pm: COLORS_PM,
    aqi: COLORS_AQI,
    mcp: COLORS_PDK,
    speed: COLORS_SPEED,
    dir: COLORS_DIR,
}

const HOURS = [];
for (let i = 0; i < 24; i += 3) {
    let hour = i < 10 ? `0${i}:00` : `${i}:00`
    HOURS.push(hour);
}

async function Download(dates, project, indicators, interval) {
    const i = indicators.map(i => {
        return CODES[i];
    })

    const URLs = project.map(p => {
        return `https://sensor.krasn.ru/sc/api/1.0/projects/${p}/aggvalues?&key=aa0orjtt0npfwyym&time_begin=${dates[0]} 00:00:00&time_end=${dates[dates.length - 1]} 23:00:00&time_interval=${interval}&indicators=${i}&limit=30000'`;
    })

    const inquiries = URLs.map(u => {
        return fetch(u)
    })

    const promise = Promise.all(inquiries)

    const data = await promise.then(d => {
        const result = [];
        for (let j = 0; j < d.length; j++) {
            result.push(XML2JSON(d[j], project[j]));
        }
        return result;
    })

    const r = [];
    for (let j = 0; j < data.length; j++) {
        r.push(...await data[j])
    }

    return r;
}

async function DownloadWind(dates, indicators, interval) {
    const i = indicators.map(i => {
        return CODES[i];
    })
    const URL = `https://sensor.krasn.ru/sc/api/1.0/projects/6/aggvalues?&key=aa0orjtt0npfwyym&sites=4203&time_begin=${dates[0]} 00:00:00&time_end=${dates[dates.length - 1]} 23:00:00&time_interval=${interval}&indicators=${i}&limit=30000'`;
    const responce = fetch(URL);
    const result = responce.then(e => XML2JSON(e));
    return result;
}

async function DownloadSites(dates, project) {

    const URLs = project.map(p => {
        return `https://sensor.krasn.ru/sc/api/1.0/projects/${p}/sites?&key=aa0orjtt0npfwyym&time_begin=${dates[0]} 00:00:00&time_end=${dates[dates.length - 1]} 00:00:00&limit=30000'`;
    })

    const inquiries = URLs.map(u => {
        return fetch(u)
    })

    const promise = Promise.all(inquiries)

    const data = await promise.then(d => {
        const result = [];
        for (let j = 0; j < d.length; j++) {
            result.push(XML2JSONSites(d[j]));
        }
        return result;
    })

    const r = [];
    for (let j = 0; j < data.length; j++) {
        r.push(...await data[j])
    }

    return r
}

async function XML2JSON(e, p) {
    const data = e.text().then(e => {
        const result = [];
        const dom = new DOMParser();
        const xml = dom.parseFromString(e, "text/xml");
        const aggvalues = xml.getElementsByTagName("aggvalue");
        aggvalues.forEach((element) => {
            const indicator = element.getAttribute("indicator")
            const time = element.getAttribute("time").substring(0, element.getAttribute("time").length - 3).split(' ')[0];
            const hour = element.getAttribute("time").substring(0, element.getAttribute("time").length - 3).split(' ')[1]
            const value = Number((element.getElementsByTagName("avg")[0].innerHTML)).toFixed(6);
            const min = Number((element.getElementsByTagName("min")[0].innerHTML)).toFixed(6);
            const max = Number((element.getElementsByTagName("max")[0].innerHTML)).toFixed(6);
            const site = element.getAttribute("site");
            const coordinates = element.getElementsByTagName("location")[0];
            if (coordinates) {
                const x = coordinates.getAttribute("x");
                const y = coordinates.getAttribute("y");
                result.push({
                    site: site,
                    project: p,
                    indicator: indicator,
                    time: time,
                    hour: hour,
                    value: value,
                    min: min,
                    max: max,
                    coordinates: proj4("EPSG:4326", "EPSG:28416", [
                        Number(x),
                        Number(y),
                    ])
                })
            }
        })
        return result;
    })
    return data;
}

async function XML2JSONSites(e) {
    const data = e.text().then(e => {
        const result = [];
        const dom = new DOMParser();
        const xml = dom.parseFromString(e, "text/xml");
        const sites = xml.getElementsByTagName("site");
        sites.forEach((site) => {
            const id = site.getAttribute("id")
            const coordinates = site.getElementsByTagName("location")[0];
            const name = site.getElementsByTagName("name")[0].innerHTML;
            if (coordinates) {
                result.push({
                    id: id,
                    name: name
                })
            }
        })
        return result;
    })
    return data;
}

async function CreateDates() {
    const today = new Date();
    const start = new Date();
    const dates = [];
    start.setDate(start.getDate() - 7)

    while (start.getTime() < today.getTime()) {
        dates.push(formatDate(start));
        start.setDate(start.getDate() + 1);
    }
    return dates;
}

function formatDate(date) {
    var dd = date.getDate();
    if (dd < 10) dd = "0" + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = "0" + mm;

    var yy = date.getFullYear();
    if (yy < 10) yy = "0" + yy;

    return yy + "-" + mm + "-" + dd;
}

function DateToText(e, c) {
    if (c) {
        const date = e.split(' ')[0].split('-');
        const result = new Date(date[0], date[1] - 1, date[2], 0, 0, 0).toLocaleString('ru', {
            month: 'short',
            day: 'numeric',
        });
        return result
    }
    if (e != undefined) {
        const date = e.split(' ')[0].split('-');
        const result = new Date(date[0], date[1] - 1, date[2], 0, 0, 0).toLocaleString('ru', {
            month: 'short',
            day: 'numeric',
            weekday: 'short',
        });
        return result
    } else {
        return new Date().toLocaleString('ru', {
            month: 'long',
            day: 'numeric',
            weekday: 'long',
            hour: 'numeric',
            minute: 'numeric',
        });
    }
}

function GetData(data, time, indicator) {
    const code = CODES[indicator];
    const result = data.filter(e => { if (e.time == time && (e.indicator == code || e.indicator == indicator)) return e });
    return result;
}

function GetDataAllTime(data, indicator) {
    const code = CODES[indicator];
    const result = data.filter(e => { if (e.indicator == code || e.indicator == indicator) return e });
    return result;
}

function CreateLayers(data, indicator) {
    const layers = data.map(e => {
        let value = 0;
        if (indicator == "pm" || indicator == "aqi") {
            value = (e.value * CONVERSION[indicator]).toFixed(0);
        }
        if (indicator == "mcp") {
            value = (e.value * CONVERSION[indicator]).toFixed(2);
        }
        for (let i = 1; i < RANGES[indicator].length; i++) {
            if (Number(value) >= RANGES[indicator][i - 1] && Number(value) < RANGES[indicator][i]) {
                return {
                    id: e.site,
                    project: e.project,
                    fill: COLORS[indicator][i - 1].color,
                    radius: 27,
                    value: value,
                    text: COLORS[indicator][i - 1].text,
                    font: '20px sans-serif',
                    stroke: {
                        color: "white",
                        width: 2
                    },
                    zindex: 10,
                    coordinates: e.coordinates
                }
            }
        }
    })
    return layers;
}

function DivideLayers(layers, projects) {
    if (!layers || !projects)
        return []
    let result = []
    projects.forEach((p, index) => {
        result.push({ project: p, features: [] });
        layers.forEach(l => {
            if (l.properties.project == p) {
                result[index].features.push(l);
            }
        })
    })
    return result
}

function CreatePDK(data) {
    const CC = 35;
    const PDK = data.map(d => {
        const value = d.value * 1000;
        const PDK = (value / CC).toFixed(2);
        return {
            site: d.site,
            indicator: "371",
            project: d.project,
            time: d.time,
            hour: d.hour,
            value: PDK,
            coordinates: d.coordinates
        }
    });
    return PDK;
}

function CreateColoredTooltips(data, dates, indicator) {
    /* Среднее */
    const avg = dates.map(d => {
        const timeData = GetData(data, d, indicator);

        const timeDataAVG = AVG(timeData, indicator);
        console.log(timeData, timeDataAVG);
        return { AVG: timeDataAVG };
    });


    /* Сборка */
    const coloredBox = avg.map(a => {
        for (let i = 0; i < RANGES[indicator].length; i++) {
            if (Number(a.AVG) >= RANGES[indicator][i - 1] && Number(a.AVG) < RANGES[indicator][i]) {
                return { color: COLORS[indicator][i - 1].color, text: COLORS[indicator][i - 1].text, value: a.AVG };
            }
        }
    })
    return coloredBox;
}

function AVG(data, indicator) {
    const filtered = data.filter(d => d.project != 12)
    let amount = 0;
    const length = filtered.length;
    filtered.forEach(d => {
        amount += Number(d.value);
    })

    if (indicator == "pm" || indicator == "aqi" || indicator == "temp") {
        return ((amount / length) * CONVERSION[indicator]).toFixed(0);
    }
    if (indicator == "mcp") {
        return ((amount / length) * CONVERSION[indicator]).toFixed(2);
    }
}

function AVGperHour(data, indicator) {
    const result = [];
    for (let i = 0; i < HOURS.length; i++) {
        const d = data.filter(e => { if (e.hour == HOURS[i]) return e });
        const value = AVG(d, indicator)
        result.push({ hour: HOURS[i], value: value, time: d[0].time })
    }

    return result;
}

function GlueData(data) {
    const datasets = [];
    for (let i = 0; i < data.length; i++) {
        datasets.push(...data[i].datasets);
    }

    return datasets;
}

function CreateDataForChart(data, indicator) {
    let labels = [];
    let values = [];
    let background = [];
    if (indicator != "dir") {
        data.forEach(d => {
            if (d.hour == "00:00") {
                labels.push(DateToText(d.time, true))
            } else {
                labels.push(d.hour)
            }
            const value = Number(d.value);
            if (indicator == "mcp") {
                values.push(value.toFixed(2))
            } else {
                values.push(value.toFixed(1))
            }
            for (let i = 0; i < RANGES[indicator].length; i++) {
                if (Number(d.value) >= RANGES[indicator][i - 1] && Number(d.value) < RANGES[indicator][i]) {
                    background.push(COLORS[indicator][i - 1].color);
                }
            }
        })
    } else {
        labels = DIR_TEXT;
        values = data;
        data.forEach(d => {
            for (let i = 0; i < RANGES[indicator].length; i++) {
                if (Number(d) >= RANGES[indicator][i - 1] && Number(d) < RANGES[indicator][i]) {
                    background.push(COLORS[indicator][i - 1].color);
                }
            }
        });
    }
    const result = {
        labels: labels,
        indicator: indicator,
        datasets: [{
            label: TEXT[indicator],
            backgroundColor: background,
            borderWidth: 1,
            data: values
        }]
    };
    return result;
}

function DirectionToText(value) {
    if (value >= 0 && value < 11.25)
        return "С"
    if (value >= 11.25 && value < 33.75)
        return "ССВ"
    if (value >= 33.75 && value < 56.25)
        return "СВ"
    if (value >= 56.25 && value < 78.75)
        return "ВСВ"
    if (value >= 78.75 && value < 101.25)
        return "В"
    if (value >= 101.25 && value < 123.75)
        return "ВЮВ"
    if (value >= 123.75 && value < 146.25)
        return "ЮВ"
    if (value >= 146.25 && value < 168.75)
        return "ЮЮВ"
    if (value >= 168.75 && value < 191.25)
        return "Ю"
    if (value >= 191.25 && value < 213.75)
        return "ЮЮЗ"
    if (value >= 213.75 && value < 236.25)
        return "ЮЗ"
    if (value >= 236.25 && value < 258.75)
        return "ЗЮЗ"
    if (value >= 258.75 && value < 281.25)
        return "З"
    if (value >= 281.25 && value < 303.75)
        return "ЗСЗ"
    if (value >= 303.75 && value < 326.25)
        return "СЗ"
    if (value >= 326.25 && value < 348.75)
        return "ССЗ"
    if (value >= 348.75)
        return "С"
}

function DirectionRound(value) {
    if (value >= 0 && value < 11.25)
        return 0
    if (value >= 11.25 && value < 33.75)
        return 22.5
    if (value >= 33.75 && value < 56.25)
        return 45
    if (value >= 56.25 && value < 78.75)
        return 67.5
    if (value >= 78.75 && value < 101.25)
        return 90
    if (value >= 101.25 && value < 123.75)
        return 112.5
    if (value >= 123.75 && value < 146.25)
        return 135
    if (value >= 146.25 && value < 168.75)
        return 157.5
    if (value >= 168.75 && value < 191.25)
        return 180
    if (value >= 191.25 && value < 213.75)
        return 202.5
    if (value >= 213.75 && value < 236.25)
        return 225
    if (value >= 236.25 && value < 258.75)
        return 247.5
    if (value >= 258.75 && value < 281.25)
        return 270
    if (value >= 281.25 && value < 303.75)
        return 292.5
    if (value >= 303.75 && value < 326.25)
        return 315
    if (value >= 326.25 && value < 348.75)
        return 337.5
    if (value >= 348.75)
        return 0
}

function CountDirections(e) {
    const direction = [];
    e.forEach(element => {
        if (element.speed > 0.5)
            direction.push(element.text);
    })
    const counts = direction.reduce(function(acc, el) {
        acc[el] = (acc[el] || 0) + 1;
        return acc;
    }, {});
    const result = [];
    DIR_TEXT.forEach(i => {
        (counts[i]) ? result.push(counts[i]): result.push(0)
    });
    return result
}

function PercentDirection(e) {
    const length = 24;
    let sum = 0;
    const result = e.map(d => {
        sum += d;
        return d;
    })
    const calm = (100 - (sum / length * 100)).toFixed(0);
    return { calm, direction: result };
}
export { DivideLayers, Download, DownloadWind, CreateLayers, GetData, GetDataAllTime, CreateDates, CreateColoredTooltips, DateToText, CreatePDK, DirectionToText, DownloadSites, AVGperHour, CreateDataForChart, DirectionRound, GlueData, CountDirections, PercentDirection }