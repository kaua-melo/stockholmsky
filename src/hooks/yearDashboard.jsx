import "./css/yearDashboard.css";
import { Fragment, useState, useRef, useEffect, useCallback } from "react";

// Icons
import musicIconUnselected from "../assets/icons/music_icon_unselected.svg";
import musicIconSelected from "../assets/icons/music_icon_selected.svg";
import closeIconUnselected from "../assets/icons/close_sign_inactivatted.svg";

// To load data
import { getYear } from "../services/cloud_data_functions";

// Components:
import SortingOptions from "./sortingOptions";
import CloudFiltering from "./cloudFiltering";
import GraphsBoard from "./graphsBoard";

function YearDashboard(props) {
  const yearDashboardDiv = useRef(null);
  const closingButtonBorderRef = useRef(null);
  const closeIconRef = useRef(null);

  // The data we'll display
  const [data, setData] = useState([]);

  // 1 -> < X px
  // 2 -> > X and < X px
  // 3 -> > X px
  const [dashboardDisplayingMode, setDashboardDisplayingMode] = useState(3);

  // 0 -> music is selected
  // 1 -> cloud %
  // 2 -> date
  // 3 -> month
  const [selectedMethod, setSelectedMethod] = useState(3);
  // If true -> we are playing the music.
  const [musicMethod, setMusicMethod] = useState(false);

  const unselectedMusicIcon = useRef(null);
  const selectedMusicIcon = useRef(null);

  // Filtering values
  const [filterMin, setFilterMin] = useState(0);
  const [filterMax, setFilterMax] = useState(100);

  // var resizer = null;
  var resizer = useRef(null);

  // Methods --------------------------------------------------
  // We are using 'useCallback' here because we are using React.memo
  //  on cloudFiltering. So we render cloudFiltering only when the props
  //  change, and not everytime this component renders. useCallback guarantee
  //  that every new render we are sending the same instance of this function.
  const handleFilterValuesChanged = useCallback((_min, _max) => {
    setFilterMin(_min);
    setFilterMax(_max);
  }, []);

  useEffect(() => {
    // Fading in:
    setTimeout(function () {
      // yearDashboardDiv.current.style["visibility"] = "visible";
      yearDashboardDiv.current.style["opacity"] = 1;
    }, 10);

    // Loading the data
    async function getData() {
      const result = await getYear(props.year);
      // console.log("setData()");
      setData(result.data);
    }
    getData();

    // Adding the ResizeObserver event.
    resizer.current = new ResizeObserver(handleYearDashboardResize);
    resizer.current.observe(yearDashboardDiv.current);

    // Executed when the component is destroyed.
    return () => {
      // Kill/disconnect the resize event when the component is destroyed.
      resizer.current.disconnect();
    };
  }, [props]);

  // This will be called everytime the yearDashboardDiv is resized.
  function handleYearDashboardResize() {
    if (yearDashboardDiv.current) {
      let dashboardWidth =
        yearDashboardDiv.current.getBoundingClientRect().width;

      // 610, 705,
      // 'Sort by' and 'cloud%' disappears.
      if (dashboardWidth <= 610) {
        setDashboardDisplayingMode(1);
      }
      // 'Sort by' disappears.
      else if (dashboardWidth > 610 && dashboardWidth <= 660) {
        setDashboardDisplayingMode(2);
      }
      // Nothing disappears.
      else if (dashboardWidth > 660) {
        setDashboardDisplayingMode(3);
      }
    }
  }

  // Using 'useCallback' because we use React.memo on sortingOptions
  const handleChangeSortingMethod = useCallback((m) => {
    setSelectedMethod(m);

    // If the music method was on, let's remove it.
    if (musicMethod) {
      // Hide the selected SVG (blue)
      if (selectedMusicIcon.current) {
        selectedMusicIcon.current.style["visibility"] = "invisible";
        selectedMusicIcon.current.style["opacity"] = 0;
      }

      setMusicMethod(false);
    }
  }, []);

  function handleOnClickMusic() {
    if (!musicMethod) {
      // Show the selected SVG (blue)
      if (selectedMusicIcon.current) {
        alert("Not implemented yet :( Soon!");
        // selectedMusicIcon.current.style["visibility"] = "visible";
        // selectedMusicIcon.current.style["opacity"] = 1;
      }

      // Let's unhighlight all sorting methods.
      // setSelectedMethod(0);

      // Let's save the musicMethod state.
      // setMusicMethod(true);
    }
    // If the music icon was already selected:
    else {
      // Hide the selected SVG (blue)
      if (selectedMusicIcon.current) {
        selectedMusicIcon.current.style["visibility"] = "hidden";
        selectedMusicIcon.current.style["opacity"] = 0;
      }

      // Let's highlight a sorting methods.
      setSelectedMethod(3);

      // Let's save the musicMethod state.
      setMusicMethod(false);
    }
  }
  // ----------------------------------------------------------

  function mouseEnterClosingButton() {
    if (closingButtonBorderRef.current) {
      closingButtonBorderRef.current.style["width"] = "100%";
      closingButtonBorderRef.current.style["height"] = "100%";
    }

    // Show X img
    if (closeIconRef.current) {
      closeIconRef.current.style["opacity"] = 1;
    }
  }

  function mouseLeaveClosingButton() {
    if (closingButtonBorderRef.current) {
      closingButtonBorderRef.current.style["width"] = "50%";
      closingButtonBorderRef.current.style["height"] = "50%";
    }

    // Hide X img
    if (closeIconRef.current) {
      closeIconRef.current.style["opacity"] = 0;
    }
  }

  return (
    <Fragment>
      {/* {console.log("-- yearDashboard - render - data.lenth: " + data.length)} */}

      <div
        className={
          props.index % 2 === 0 && props.nYears > 1
            ? "grid_item_container right_border"
            : "grid_item_container"
        }
      >
        <div className="year_dashboard" ref={yearDashboardDiv}>
          <div className="header">
            <div className="header_and_closing_button">
              <p className="year_header">{props.year}</p>
              <div
                className="closing_button_container"
                onMouseEnter={mouseEnterClosingButton}
                onMouseLeave={mouseLeaveClosingButton}
              >
                <div
                  className="closing_button_border"
                  ref={closingButtonBorderRef}
                  onClick={function () {
                    // So we can fade out faster than we fade in
                    yearDashboardDiv.current.style["-webkit-transition"] =
                      "opacity 0.5s ease-in";
                    yearDashboardDiv.current.style["-moz-transition"] =
                      "opacity 0.5s ease-in";
                    yearDashboardDiv.current.style["-ms-transition"] =
                      "opacity 0.5s ease-in";
                    yearDashboardDiv.current.style["-o-transition"] =
                      "opacity 0.5s ease-in";
                    yearDashboardDiv.current.style["transition"] =
                      "opacity 0.5s ease-in";

                    // Fade out
                    yearDashboardDiv.current.style["opacity"] = 0;

                    setTimeout(function () {
                      props.removeYear(props.year);
                    }, 500);
                  }}
                >
                  <img
                    src={closeIconUnselected}
                    alt="x"
                    ref={closeIconRef}
                  ></img>
                </div>
              </div>
            </div>

            <div className="dashboard_menu_container">
              <SortingOptions
                // Variables:
                dashboardDisplayingMode={dashboardDisplayingMode}
                selectedMethod={selectedMethod}
                // Methods:
                handleChangeSortingMethod={handleChangeSortingMethod}
              />

              <CloudFiltering
                dashboardDisplayingMode={dashboardDisplayingMode}
                handleFilterValuesChanged={handleFilterValuesChanged}
              />

              <div className="sonify_container">
                <div className="music_icon_wrapper">
                  <img
                    className="music_icon_img_unselected"
                    src={musicIconUnselected}
                    alt=""
                    onClick={handleOnClickMusic}
                    ref={unselectedMusicIcon}
                  />
                  <img
                    className="music_icon_img_selected"
                    src={musicIconSelected}
                    alt=""
                    onClick={handleOnClickMusic}
                    ref={selectedMusicIcon}
                  />
                </div>
              </div>
            </div>
          </div>

          <GraphsBoard
            data={data}
            year={props.year}
            filterMin={filterMin}
            filterMax={filterMax}
            selectedMethod={selectedMethod}
          />
        </div>
      </div>
    </Fragment>
  );
}

export default YearDashboard;
