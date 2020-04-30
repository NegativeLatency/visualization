import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import LineChartCom from './components/LineChartCom'
import { Radio, Switch, Button  } from 'antd'
import './css/index.css'

let data = require('./assets/spectator-tests.json');
console.log(data)
let tempData = data.map((it) => it[4])
let preparedData = {};
tempData.forEach((it) => {
    preparedData[it.type] = {
        optimal: it.data
    }
});

console.log(preparedData);
const protocals = Object.keys(preparedData);
const conditions = ["Optimal", "worst", "low bandwidth", "high package loss", "high bandwidth"]

function getSpecData(preparedData) {
  let times = [],
      res = {
          y: "latency (ms)",
          series: []
      },
      now = new Date().getTime();

  res.range = [0, preparedData[protocals[0]]["optimal"].length]
  res.dates = preparedData[protocals[0]]["optimal"].map((it, idx) => now + 1000*idx)
  protocals.forEach(item => {
      let temp = preparedData[item]["optimal"].map((it) => it.delay);
      res.series.push({
          name: item,
          values: temp
      });
  })
  // console.log('res', res)
  return res;
}

const conditionMap = {
  "Optimal": 0,
  "worst": 5,
  "high package loss": 1,
  "low bandwidth": 3,
  "high bandwidth": 4
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: preparedData,
      processedData: getSpecData(preparedData),
      dataRangeRight: 1,
      isSmooth: true,
      charts: [{condition: "optimal", protocals: protocals}],
      condition: "Optimal",
      protocal: protocals[0]
    }
    
    this.newChartInput = React.createRef();
  }

  componentDidMount() {
    let interval = 1000;
    this.timer = setInterval(() => {
      this.setDataRange()
    }, interval);;
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  setDataRange = () => {
    let step = 50;
    this.setState( state => {
      let maxLength = state.data.RTMP.optimal.length;
      if (state.dataRangeRight + step > maxLength) {
        clearInterval(this.timer);
        return {dataRangeRight: maxLength}
      }
      return {dataRangeRight: state.dataRangeRight + step};
    });
  }

  fetchData = () => {
    // this.setState({data: preparedData});
  }

  toggleSmoothData = () => {
    this.setState(state => {
      return {isSmooth: !state.isSmooth}
    })
  }

  getNewChartInput = (e) => {
    let newChart = {
      condition: this.state.condition,
      protocals: [this.state.protocal]
    }
    this.setState(state => {
      return {charts: state.charts.concat(newChart)}
    })
  }

  handleConditionChange = (e) => {
    this.setState({condition: e.target.value});
    console.log(e.target.value)
    let tempData = data.map((it) => it[conditionMap[e.target.value]])
    let preparedData = {};
    tempData.forEach((it) => {
        preparedData[it.type] = {
            optimal: it.data
        }
    });
    this.setState({processedData: getSpecData(preparedData)})

  }


  render() {
    return (
      <div>
        <div className="control-panel">
          <div id='addChart-panel'>
            <form id="chooseAttr" ref={this.newChartInput}>
              <div id="protocalArea" className="chooseProtocal">
                <Radio.Group options={protocals} value={this.state.protocal} onChange={(e) => {this.setState({protocal: e.target.value})}}/>
              </div>
              <div id="conditionArea" className="chooseCondition">
                <Radio.Group options={conditions} value={this.state.condition} onChange={this.handleConditionChange}/>
              </div>
            </form>
            <Button className='add-btn' onClick={this.getNewChartInput}>Add a chart</Button>
          </div>

          <div id='checkbox-panel'>
            <Switch onClick={this.toggleSmoothData} defaultChecked/>
            <label>Smooth Data</label>
          </div>
        </div>

        
        <div id='charts'>
          {this.state.charts.map( (val, idx) => {
            return <LineChartCom 
              key={idx}
              data={this.state.processedData}
              dataRangeRight = {this.state.dataRangeRight}
              isSmooth={this.state.isSmooth}
            />
          } )}
        </div>
      </div>
      
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);