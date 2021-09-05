import "./css/multiRangeSlider.css";

import { Fragment, useEffect, useState, useRef, memo } from "react";

// function MultiRangeSlider(props) {

const MultiRangeSlider = memo(function MultiRangeSlider(props) {
  const [minValue, setMinValue] = useState(props.filterMinValue);
  const [maxValue, setMaxValue] = useState(props.filterMaxValue);

  const selectedRangeRef = useRef(null);

  useEffect(() => {
    // Call props function to update the min and max values
    props.updateFilteringValues(Math.floor(minValue), Math.floor(maxValue));

    // Defining the width of the selected_range
    if (selectedRangeRef.current) {
      selectedRangeRef.current.style.left = `${minValue}%`;
      selectedRangeRef.current.style.width = `${maxValue - minValue}%`;
    }
  }, [minValue, maxValue, props]);

  return (
    <Fragment>
      {/* {console.log("-- multiRangeSlider - render")} */}
      <div className="mslider_container">
        <input
          className="slider_min"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={minValue}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value <= maxValue - 1) {
              setMinValue(Number(value));
            }
          }}
          onMouseDown={props.showInfobox}
          onMouseUp={props.hideInfobox}
        />

        <input
          className="slider_max"
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={maxValue}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value >= minValue + 1) {
              setMaxValue(Number(value));
            }
          }}
          onMouseDown={props.showInfobox}
          onMouseUp={props.hideInfobox}
        />

        {/* Creating our own slider here */}
        <div className="slider">
          <div className="track" />
          <div ref={selectedRangeRef} className="selected_range" />
        </div>
      </div>
    </Fragment>
  );
});

export default MultiRangeSlider;
