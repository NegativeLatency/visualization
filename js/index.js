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
})

var protocals = ["RTMP", "HLS"];

function foo(n, condition, protocals) {
  let now = Date.now(), times = [], res = {y: "latency (s)", series: []};
  for (let i = 0; i < n; i++) {
      times.push(now + 1000*i);
  }
  res.dates = times;
  protocals.forEach(item => {
      let temp = [];
      for (let i = 0; i < n; i++) {
          temp.push(d3.randomUniform(fake[item][condition][0], fake[item][condition][1])());
      }
      console.log(temp)
      res.series.push({name: item, values: temp});
  })
  return res;
}

var data = foo(200, "optimal", protocals);

// set layout 
var margin = ({top: 20, right: 20, bottom: 30, left: 30})

var height = 300, width = 900;

// helper functions
reveal = path => path.transition()
    .duration(5000)
    .ease(d3.easeLinear)
    .attrTween("stroke-dasharray", function() {
      const length = this.getTotalLength();
      return d3.interpolate(`0,${length}`, `${length},${length}`);
    })

function colors(i){
      return ["steelblue", "orangered"][i]
    }

// svg
x = d3.scaleUtc()
    .domain(d3.extent(data.dates))
    .range([margin.left, width - margin.right])

y = d3.scaleLinear()
    // .domain([0, d3.max(data.series, d => d3.max(d.values))]).nice()
    .domain([0, 20]).nice()
    .range([height - margin.bottom, margin.top])

xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))

yAxis = g => g
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .call(g => g.select(".domain").remove())
    .call(g => g.select(".tick:last-of-type text").clone()
    .attr("x", 3)
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text(data.y))

line = d3.line()
    .defined(d => !isNaN(d))
    .x((d, i) => x(data.dates[i]))
    .y(d => y(d))


const svg = d3.select("body").append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("overflow", "visible");

svg.append("g")
    .call(xAxis);

svg.append("g")
    .call(yAxis);

const path = svg.append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .selectAll("path")
    .data(data.series)
    .join("path")
    .style("mix-blend-mode", "multiply")
    .attr("d", d => line(d.values)).attr("stroke", function(d, i) { return colors(i); })
    .call(reveal);
