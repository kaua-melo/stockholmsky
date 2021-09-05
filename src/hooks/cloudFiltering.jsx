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

// function CloudFiltering(props) {
const CloudFiltering = memo(function CloudFiltering(props) {
  const [filterMinValue, setFilterMinValue] = useState(0);
  const [filterMaxValue, setFilterMaxValue] = useState(100);

  const [minValueImg, setMinValueImg] = useState(null);
  const [maxValueImg, setMaxValueImg] = useState(null);

  const infoboxMinP = useRef(null);
  const infoboxMaxP = useRef(null);

  const cloudPInfobox = useRef(null);

  // This object will contain the 'info_photos.json'. Which is the json with
  //  information about all the photos that we have on the database that we can display.
  // "photosInfo" looks like this:
  // {
  //   "imageExtension": "jpg",
  //   "cloudPercentagesAvailable": [0, 1, 7, 8],
  //   "photos": [{
  //       "percentage": 0,
  //       "ids": [0, 1, 2, 3, 4, 5, 6]
  //     },
  //     {
  //       "percentage": 1,
  //       "ids": [10, 22, 13, 15]
  //     }
  //   ]
  // }
  const [photosInfo, _setPhotosInfo] = useState(null);
  const photosInfoRef = useRef(photosInfo);
  const setPhotosInfo = (data) => {
    photosInfoRef.current = data;
    _setPhotosInfo(data);
  };

  // Component loaded
  useEffect(() => {
    // Loading 'info_photos.json'
    const getPhotosInfo = () => {
      fetch(process.env.PUBLIC_URL + "/photos/info_photos.json", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (myJson) {
          setPhotosInfo(myJson);
        });
    };
    getPhotosInfo();
  }, []);

  // photosInfo is loaded. Let's
  useEffect(() => {
    if (photosInfoRef.current) {
      // It might happen that in our database we don't have all %clouds (from 0 to 100%).
      // Here we get the closest %cloud available in our database to 'min' on the filtering
      // tool.
      var closestPCloudAvailable = getClosestItem(
        filterMinValue,
        photosInfoRef.current["cloudPercentagesAvailable"]
      );
      const minCloudPercentageAvailable = closestPCloudAvailable;
      // And we do the same to the 'max' on the filtering tool.
      closestPCloudAvailable = getClosestItem(
        filterMaxValue,
        photosInfoRef.current["cloudPercentagesAvailable"]
      );
      const maxCloudPercentageAvailable = closestPCloudAvailable;

      // Setting the minValue and maxValue images ----------------------------
      // minValue image:
      // minPhotosInfo = { "percentage": 0, "ids": [0, 1, 2, 3, 4, 5, 6] }
      var minPhotosInfo = photosInfoRef.current["photos"].filter(
        (p) => p["percentage"] === minCloudPercentageAvailable
      )[0];
      var minPhotoId = minPhotosInfo["ids"][0];

      setMinValueImg(
        process.env.PUBLIC_URL +
          "/photos/" +
          minCloudPercentageAvailable +
          "_" +
          minPhotoId +
          "." +
          photosInfoRef.current["imageExtension"]
      );

      // Setting the maxValue image:
      var maxPhotosInfo = photosInfoRef.current["photos"].filter(
        (p) => p["percentage"] === maxCloudPercentageAvailable
      )[0];
      var maxPhotoId = maxPhotosInfo["ids"][0];

      setMaxValueImg(
        process.env.PUBLIC_URL +
          "/photos/" +
          maxCloudPercentageAvailable +
          "_" +
          maxPhotoId +
          "." +
          photosInfoRef.current["imageExtension"]
      );
    }
  }, [photosInfoRef.current]);

  // function updateFilteringValues(min, max) {
  const updateFilteringValues = useCallback((min, max) => {
    if (photosInfoRef.current) {
      setFilterMinValue(min);
      setFilterMaxValue(max);

      // It might happen that in our database we don't have all %clouds (from 0 to 100%).
      // Here we get the closest %cloud available in our database to 'min' on the filtering
      // tool.
      var closestPCloudAvailable = getClosestItem(
        min,
        photosInfoRef.current["cloudPercentagesAvailable"]
      );
      const minCloudPercentageAvailable = closestPCloudAvailable;
      // And we do the same to the 'max' on the filtering tool.
      closestPCloudAvailable = getClosestItem(
        max,
        photosInfoRef.current["cloudPercentagesAvailable"]
      );
      const maxCloudPercentageAvailable = closestPCloudAvailable;

      // Setting the minValue and maxValue images ----------------------------
      // minValue image:
      // minPhotosInfo = { "percentage": 0, "ids": [0, 1, 2, 3, 4, 5, 6] }
      var minPhotosInfo = photosInfoRef.current["photos"].filter(
        (p) => p["percentage"] === minCloudPercentageAvailable
      )[0];
      var minPhotoId = minPhotosInfo["ids"][0];

      setMinValueImg(
        process.env.PUBLIC_URL +
          "/photos/" +
          minCloudPercentageAvailable +
          "_" +
          minPhotoId +
          "." +
          photosInfoRef.current["imageExtension"]
      );

      // Setting the maxValue image:
      var maxPhotosInfo = photosInfoRef.current["photos"].filter(
        (p) => p["percentage"] === maxCloudPercentageAvailable
      )[0];
      var maxPhotoId = maxPhotosInfo["ids"][0];

      setMaxValueImg(
        process.env.PUBLIC_URL +
          "/photos/" +
          maxCloudPercentageAvailable +
          "_" +
          maxPhotoId +
          "." +
          photosInfoRef.current["imageExtension"]
      );
      // ---------------------------------------------------------------------

      // Setting the minValue image
      // setMinValueImg(skyImages["s" + Math.floor(min / 10)]);

      // if (max === 100) {
      //   setMaxValueImg(skyImages["s9"]);
      // } else {
      //   setMaxValueImg(skyImages["s" + Math.floor(max / 10)]);
      // }

      // Updating the Filtering values on the mother's component:
      props.handleFilterValuesChanged(min, max);
    }
  }, []);

  // Returns the closest item on an array
  function getClosestItem(value, array) {
    return array.reduce((a, b) => {
      let aDiff = Math.abs(a - value);
      let bDiff = Math.abs(b - value);

      if (aDiff === bDiff) {
        return a > b ? a : b;
      } else {
        return bDiff < aDiff ? b : a;
      }
    });
  }

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
  return <Fragment>{renderCloudFiltering()}</Fragment>;
});

export default CloudFiltering;
