import data from './spectator-test-1.json'

var chartNum = 0;

const promisedJson = (jsonFile) => {
    return new Promise((resolve, reject) => {
        d3.json(jsonFile, (it) => {
            resolve(it);
        });
    });
}

// helper functions
const reveal = path => path.transition()
    .duration(3000)
    .ease(d3.easeLinear)
    .attrTween("stroke-dasharray", function () {
        const length = this.getTotalLength();
        return d3.interpolate(`0,${length}`, `${length},${length}`);
    })

function colors(i) {
    return ["steelblue", "orangered"][i]
}
function hover(svg, path, data, x, y) {

    const pathStroke = path.attr("stroke");
  
    if ("ontouchstart" in document) svg
        .style("-webkit-tap-highlight-color", "transparent")
        .on("touchmove", moved)
        .on("touchstart", entered)
        .on("touchend", left)
    else svg
        .on("mousemove", moved)
        .on("mouseenter", entered)
        .on("mouseleave", left);
  
    const dot = svg.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);
  
    function moved() {
      d3.event.preventDefault();
      const ym = y.invert(d3.event.layerY);
      const xm = x.invert(d3.event.layerX);
    //   console.log(xm, ym)
      const i1 = d3.bisectLeft(data.dates, xm, 1);
      const i0 = i1 - 1;
      const i = xm - data.dates[i0] > data.dates[i1] - xm ? i1 : i0;
      const s = d3.least(data.series, d => Math.abs(d.values[i] - ym));
      console.log(s)
    //   path.attr("stroke", d => d === s ? pathStroke : "#ddd").filter(d => d === s).raise();
      dot.attr("transform", `translate(${x(data.dates[i])},${y(s.values[i])})`);
      dot.select("text").text(s.name);
    }
  
    function entered() {
    //   path.style("mix-blend-mode", null).attr("stroke", "#ddd");
      dot.attr("display", null);
    }
  
    function left() {
    //   path.style("mix-blend-mode", "multiply").attr("stroke", pathStroke);
      dot.attr("display", "none");
    }
}

// set layout 
var margin = ({
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
})

var height = 300,
    width = 900;

console.log(data)
let preparedData = {}
data.forEach((it) => {
    preparedData[it.key] = {optimal: it.data}
});



var now = Date.now();

function foo(condition, protocals) {
    let times = [],
        res = {
            y: "latency (ms)",
            series: []
        };
    
    res.range = d3.extent(preparedData[protocals[0]][condition].map((it) => it[1]));
    res.dates = preparedData[protocals[0]][condition].map((it) => it[1]);
    protocals.forEach(item => {
        let temp = preparedData[item][condition].map((it) => it[0]);
        res.series.push({
            name: item,
            values: temp
        });
        console.log(res)
    })
    return res;
}
const createChart = function(className, condition, protocals) {
    let data = foo(condition, protocals);

    // svg
    let x = d3.scaleUtc()
        .domain(data.range)
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .range([height - margin.bottom, margin.top])

    let xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

    let yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .call(g => g.select(".domain").remove())
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 3)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(data.y))

    function updateChart() {
        var curveSelector = document.querySelector(".select");
        curveSelector.addEventListener("change", updateChart);
        var curve = curveSelector.options[curveSelector.selectedIndex].text;
        // console.log(curve)

        let line = d3.line()
            .defined(d => !isNaN(d))
            .x((d, i) =>  x(data.dates[i]))
            .y(d => y(d))
            .curve(d3[curve])

        d3.select(".charts").selectAll("."+className).remove();
        const svg = d3.select(".charts").append("div").attr("class", className).attr("data-idx", chartNum).append("svg")
            .attr("viewBox", [0, 0, width, height])
            .style("overflow", "visible");

        svg.append("g")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);
        console.log(data.series)
        
        const path = svg.append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(data.series)
            .join("path")
            .style("mix-blend-mode", "multiply")
            .attr("d", d => line(d.values))
            .attr("stroke", function (d, i) {
                return colors(i);
            })
            .call(reveal);
        svg.call(hover, path, data, x, y);
    }
    updateChart();
}
const protocals = Object.keys(preparedData);
const conditions = Object.keys(preparedData[protocals[0]]);
createChart("main", conditions[0], protocals);

// height *= 2;

document.querySelector(".addBtn").addEventListener("click", addNewChart);

function addNewChart() {
    chartNum++;
    var newChartAttr = document.querySelector(".chooseAttr");
    var newChartProtocal = newChartAttr.elements.protocal.value;
    var newChartcondition = newChartAttr.elements.condition.value;
    createChart("sub-"+chartNum, newChartcondition, [newChartProtocal]);
}


const protocalArea = document.getElementById("protocalArea");
const conditionArea = document.getElementById("conditionArea");
const createInputHTML = (protocal, condition) => {
    const protocolHTML = protocal ? `<label><input name="protocal" type="radio" value="${protocal}"> <i>${protocal}</i></label>` : "";
    const conditionHTML = condition ?  `<label><input name="condition" type="radio" value="${condition}"> <i>${condition}</i></label>`: "";
    protocalArea.innerHTML += protocolHTML;
    conditionArea.innerHTML += conditionHTML;
}

for (const p of protocals) {
    createInputHTML(p, null);
}
for (const c of conditions) {
    createInputHTML(null, c);
}
