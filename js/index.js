var chartNum = 0;

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

// set layout 
var margin = ({
    top: 20,
    right: 20,
    bottom: 30,
    left: 30
})

var height = 300,
    width = 900;

// set data
var fake = Object({
    "RTMP": {
        optimal: [5, 7],
        worst: [10, 13]
    },
    "HLS": {
        optimal: [7, 9],
        worst: [14, 17]
    }
});


var now = Date.now();

function foo(n, condition, protocals) {
    let times = [],
        res = {
            y: "latency (s)",
            series: []
        };
    for (let i = 0; i < n; i++) {
        times.push(now + 1000 * i);
    }
    res.dates = times;
    protocals.forEach(item => {
        let temp = [];
        for (let i = 0; i < n; i++) {
            temp.push(d3.randomUniform(fake[item][condition][0], fake[item][condition][1])());
        }
        res.series.push({
            name: item,
            values: temp
        });
    })
    return res;
}
const createChart = function(className, condition, protocals) {

    if (className.slice(0, 3) == "sub") { let height = height * 2; }

    var data = foo(200, condition, protocals);

    // svg
    let x = d3.scaleUtc()
        .domain(d3.extent(data.dates))
        .range([margin.left, width - margin.right])

    let y = d3.scaleLinear()
        // .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
        .domain([0, 20]).nice()
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
            .x((d, i) => x(data.dates[i]))
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

        svg.append("g")
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
    }
    updateChart();
}

createChart("main", "optimal", ["RTMP", "HLS"]);

// height *= 2;

document.querySelector(".addBtn").addEventListener("click", addNewChart);

function addNewChart() {
    chartNum++;
    var newChartAttr = document.querySelector(".chooseAttr");
    var newChartProtocal = newChartAttr.elements.protocal.value;
    var newChartcondition = newChartAttr.elements.condition.value;
    createChart("sub-"+chartNum, newChartcondition, [newChartProtocal]);
}

const protocals = Object.keys(fake);
const conditions = Object.keys(fake[protocals[0]]);
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
