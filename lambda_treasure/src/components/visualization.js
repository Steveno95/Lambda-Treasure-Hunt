import React from "react";
import { FlexibleXYPlot, LineSeries, MarkSeries } from "react-vis";

 class CreateMap extends React.Component {
  state = {};

  render() {
    return (
      <div 
      style={{
        margin: 'auto',
        width: '500px',
        height: '500px',
        flex: 1,
        padding: '2rem 4rem'
      }}
      > <p>Map should look like</p>
        <FlexibleXYPlot>
          {this.props.links.map(link => (
            <LineSeries strokeWidth="3" color="#E5E5E5" data={link} key={Math.random() * 100} />
          ))}
          <MarkSeries
            className="mark-series-example"
            strokeWidth={5}
            opacity="1"
            size="3"
            color="#literal"
            data={this.props.coordinates}
          />
        </FlexibleXYPlot>
      </div>
    );
  }
}

export default CreateMap;