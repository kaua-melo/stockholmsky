import "./css/cloudFiltering.css";
import {
  Fragment,
  useRef,
  useState,
  memo,
  useEffect,
  useCallback,
} from "react";

import MultiRangeSlider from "./multiRangeSlider";
import skyImages from "./skyImages";

// function CloudFiltering(props) {
const CloudFiltering = memo(function CloudFiltering(props) {
  const [filterMinValue, setFilterMinValue] = useState(0);
  const [filterMaxValue, setFilterMaxValue] = useState(100);

  const [minValueImg, setMinValueImg] = useState(skyImages["s0"]);
  const [maxValueImg, setMaxValueImg] = useState(skyImages["s9"]);

  const infoboxMinP = useRef(null);
  const infoboxMaxP = useRef(null);

  const cloudPInfobox = useRef(null);

  useEffect(() => {
    // console.log("-- useEffect cloudFiltering");
  });

  // function updateFilteringValues(min, max) {
  const updateFilteringValues = useCallback((min, max) => {
    setFilterMinValue(min);
    setFilterMaxValue(max);

    // Setting the minValue image
    setMinValueImg(skyImages["s" + Math.floor(min / 10)]);

    if (max === 100) {
      setMaxValueImg(skyImages["s9"]);
    } else {
      setMaxValueImg(skyImages["s" + Math.floor(max / 10)]);
    }

    // Updating the Filtering values on the mother's component:
    props.handleFilterValuesChanged(min, max);
  }, []);

  // function showInfobox() {
  const showInfobox = useCallback(() => {
    if (cloudPInfobox.current) {
      // cloudPInfobox.current.style["display"] = "block";
      cloudPInfobox.current.style["visibility"] = "visible";
      cloudPInfobox.current.style["opacity"] = 1;
    }
  }, []);

  // function hideInfobox() {
  const hideInfobox = useCallback(() => {
    if (cloudPInfobox.current) {
      // cloudPInfobox.current.style["display"] = "none";
      cloudPInfobox.current.style["visibility"] = "hidden";
      cloudPInfobox.current.style["opacity"] = 0;
    }
  }, []);

  function renderCloudFiltering() {
    //
    let displayMode = props.dashboardDisplayingMode;
    // console.log("displayMode: " + displayMode);

    if (displayMode === 3 || displayMode === 2) {
      return (
        <Fragment>
          <div className="percentage_cloud_container">
            <div className="percentage_cloud_wrapper">
              <div
                className="pCloud_wrapper"
                onMouseEnter={showInfobox}
                onMouseLeave={hideInfobox}
              >
                <p>% cloud:</p>
              </div>

              <div className="minP">
                <p>{filterMinValue}%</p>
              </div>
              <div className="filterBar">
                <MultiRangeSlider
                  // Properties:
                  filterMinValue={filterMinValue}
                  filterMaxValue={filterMaxValue}
                  // Methods:
                  updateFilteringValues={updateFilteringValues}
                  showInfobox={showInfobox}
                  hideInfobox={hideInfobox}
                />
                <div className="cloudP_infobox" ref={cloudPInfobox}>
                  <p>Showing days with &nbsp;%&nbsp; of cloud between:</p>
                  <div className="image_samples_container">
                    <div>
                      <p className="minP_infobox" ref={infoboxMinP}>
                        {filterMinValue}%
                      </p>
                      <img
                        className="percentages_sample_image"
                        src={minValueImg}
                        alt=""
                      />
                    </div>
                    <div>
                      <p>and</p>
                    </div>
                    <div>
                      <p className="maxP_infobox" ref={infoboxMaxP}>
                        {filterMaxValue}%
                      </p>
                      <img
                        className="percentages_sample_image"
                        src={maxValueImg}
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="maxP">
                <p>{filterMaxValue}%</p>
              </div>
            </div>
          </div>
        </Fragment>
      );
    } else if (displayMode === 1) {
      return (
        <Fragment>
          <div className="percentage_cloud_container">
            <div className="percentage_cloud_wrapper2">
              <div className="minP">
                <p>{filterMinValue}%</p>
              </div>
              <div className="filterBar">
                <MultiRangeSlider
                  // Properties:
                  filterMinValue={filterMinValue}
                  filterMaxValue={filterMaxValue}
                  // Methods:
                  updateFilteringValues={updateFilteringValues}
                  showInfobox={showInfobox}
                  hideInfobox={hideInfobox}
                />
                <div className="cloudP_infobox" ref={cloudPInfobox}>
                  <p>Showing days with &nbsp;%&nbsp; of cloud between:</p>
                  <div className="image_samples_container">
                    <div>
                      <p className="minP_infobox" ref={infoboxMinP}>
                        {filterMinValue}%
                      </p>
                      <img
                        className="percentages_sample_image"
                        src={minValueImg}
                        alt=""
                      />
                    </div>
                    <div>
                      <p>and</p>
                    </div>
                    <div>
                      <p className="maxP_infobox" ref={infoboxMaxP}>
                        {filterMaxValue}%
                      </p>
                      <img
                        className="percentages_sample_image"
                        src={maxValueImg}
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="maxP">
                <p>{filterMaxValue}%</p>
              </div>
            </div>
          </div>
        </Fragment>
      );
    }
  }
  return (
    <Fragment>
      {/* {console.log("-- cloudFiltering - rendering")} */}
      {renderCloudFiltering()}
    </Fragment>
  );
});

export default CloudFiltering;
