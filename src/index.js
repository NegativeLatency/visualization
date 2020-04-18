import React from 'react';
import ReactDOM from 'react-dom';
import LineChartCom from './components/LineChartCom'


const data = require('./assets/spectator-test-1.json');
let preparedData = {};
data.forEach((it) => {
    preparedData[it.type] = {
        optimal: it.data
    }
});
console.log(preparedData);
const protocals = Object.keys(preparedData);
const conditions = Object.keys(preparedData[protocals[0]]);

function getSpecData(condition, protocals) {
  let times = [],
      res = {
          y: "latency (ms)",
          series: []
      };

  res.range = [0, preparedData[protocals[0]][condition].length]
  res.dates = preparedData[protocals[0]][condition].map((it, idx) => idx)
  protocals.forEach(item => {
      let temp = preparedData[item][condition].map((it) => it.delay);
      res.series.push({
          name: item,
          values: temp
      });
  })
  return res;
}

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: preparedData,
      isSmooth: true,
      charts: [{condition: conditions[0], protocals: protocals}],
    }
    this.newChartInput = React.createRef();
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
    let input = this.newChartInput.current.elements;
    let newChart = {
      condition: input.condition.value,
      protocals: [input.protocal.value]
    }
    this.setState(state => {
      return {charts: state.charts.concat(newChart)}
    })
  }

  render() {
    return (
      <div>
        <div id='addChart-panel'>
          <form id="chooseAttr" ref={this.newChartInput}>
            <div id="protocalArea" className="chooseProtocal">
              {protocals.map((val, idx) => {
                return <label key={idx}><input name='protocal' type="radio" value={val} /><i>{val}</i></label>
              })}
            </div>
            <div id="conditionArea" className="chooseCondition">
              {conditions.map((val, idx) => {
                return <label key={idx}><input name='condition' type="radio" value={val} /><i>{val}</i></label>
              })}
            </div>
          </form>
          <button className='add-btn' type='button' onClick={this.getNewChartInput}>Add a chart</button>
        </div>

        <div id='checkbox-panel'>
          <input 
            type='checkbox'
            value='Smooth data'
            onChange={this.toggleSmoothData} 
            defaultChecked/>
          <label htmlFor='smooth'>Smooth data</label>
        </div>
        
        {this.state.charts.map( (val, idx) => {
          return <LineChartCom 
            key={idx}
            data={getSpecData(val.condition, val.protocals)}
            isSmooth={this.state.isSmooth}
          />
        } )}
      </div>
      
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <h1>
      hello world
    </h1>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);