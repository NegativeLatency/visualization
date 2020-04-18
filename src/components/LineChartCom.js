import React from 'react'
import ReactEcharts from 'echarts-for-react';

function LineChart(props) {

  let data = props.data;
  let smoothedData = JSON.parse(JSON.stringify(data));
  let isSmooth = props.isSmooth;
  
  smoothedData.series = data.series.map((it) => {
    const ret = {}
    let miu = it.values[0]
    ret.values = it.values.map((it) => .125 * it + .875 * miu)
    ret.name = it.name
    return ret;
  });
  
  const getOption = (data) => {
    return ({
      xAxis: {
        type: 'category',
        data: data.dates
      },
      yAxis: {
        type: 'value'
      },
      series: (isSmooth ? smoothedData : data).series.map( (val, idx) => ({name: val.name, data: val.values, type: 'line'})),
      tooltip: {
        trigger: 'axis',
        showDelay: 0,
        transitionDuration: 0.2
      },
      legend: {
        data: data.series.map(it => it.name),
        orient: 'horizontal',
        left: 'center',
        top: 'top',
      },
    })
  };

  return (
    <ReactEcharts
      option={getOption(props.data)}
      className='line-chart'
    />
  )
}

export default LineChart;