import YearDashboard from "./yearDashboard";
import "./css/fullBoard.css";
import Menu from "./menu";
import ProjectInfo from "./projectInfo";
import { Fragment, useState, useEffect, useRef } from "react";
import * as Tone from "tone"; // tone.js to play audio :)

// This will contain the whole app after the intro.
// The menu, the years grid, the info, etc...
function FullBoard(props) {
  // 'yearsShowing' = The years being displayed on the screen.
  // We are using useRef for the 'yearsShowing' variable because
  //  we are calling it from inside the d3.js .on('click', ) method.
  // If we don't do it like this we won't be able to update the
  //  'yearsShowing'. Try it without the useRef and you'll see.
  const [yearsShowing, _setYearsShowing] = useState([]);
  const yearsShowingRef = useRef(yearsShowing);
  const setYearsShowing = (data) => {
    yearsShowingRef.current = data;
    _setYearsShowing(data);
  };

  const yearsDashboardContainer = useRef(null);
  const fullPageContainerRef = useRef(null);

  const [showProjectInfo, setShowProjectInfo] = useState(false);

  // SOUND ---------------------------------------------------------------
  // Creating a synth and connect it to the main output (your speakers).
  // This will be used by the yearDashboards to play song.
  const [synth, setSynth] = useState(new Tone.Synth().toDestination());

  // Array with the years that are playing song now.
  const [yearsPlaying, setYearsPlaying] = useState([]);
  // ---------------------------------------------------------------------

  // Methods ==========================================
  // 'Constructor'
  useEffect(() => {
    setYearsShowing([props.year]);

    // Fading in:
    setTimeout(function () {
      fullPageContainerRef.current.style["opacity"] = 1;
    }, 10);
  }, [props.year]);

  // Add and remove year from the yearsPlaying array ---------------------
  function removeYearFromPlayingList(year) {
    // Cloning array
    var cloneYearsPlaying = [...yearsPlaying];
    // Removing the 'year' from the array
    cloneYearsPlaying = cloneYearsPlaying.filter(function (value, index, arr) {
      return value !== year;
    });
    // Setting the new array
    setYearsPlaying(cloneYearsPlaying);
  }
  function addYearFromPlayingList(year) {
    setYearsPlaying([...yearsPlaying, year]);
  }
  // ---------------------------------------------------------------------

  function removeYear(year) {
    // let's remove it.
    let newYearsShowing = yearsShowingRef.current.filter(function (el) {
      return el !== year;
    });
    setYearsShowing(newYearsShowing);

    // The layout is different when there are two years on the screen.
    adjustDashboardLayout();

    // In case the year was playing song, remove it from the playing list.
    removeYearFromPlayingList(year);
  }
  function addYear(year) {
    setYearsShowing([...yearsShowingRef.current, year]);

    // The layout is different when there are two years on the screen.
    adjustDashboardLayout();
  }

  function clearShowingYears() {
    setYearsShowing([]);
  }

  function adjustDashboardLayout() {
    if (yearsShowingRef.current.length > 1) {
      yearsDashboardContainer.current.style["grid-template-columns"] =
        "50% 50%";
    } else {
      yearsDashboardContainer.current.style["grid-template-columns"] =
        "100% 0%";
    }
  }

  return (
    <Fragment>
      <Menu
        yearsShowing={yearsShowing}
        removeYear={removeYear}
        addYear={addYear}
        clearShowingYears={clearShowingYears}
      />

      {showProjectInfo ? (
        <ProjectInfo setShowProjectInfo={setShowProjectInfo}></ProjectInfo>
      ) : null}

      <div id="fullpage_container" ref={fullPageContainerRef}>
        <div id="topbar">
          <div
            id="project_info_container"
            onClick={function () {
              setShowProjectInfo(true);
            }}
          >
            <span id="project_info_icon">?</span>
          </div>
          {/* {!showProjectInfo ? (
            <div
              id="project_info_container"
              onClick={function () {
                setShowProjectInfo(true);
              }}
            >
              <span id="project_info_icon">?</span>
            </div>
          ) : null} */}
        </div>

        <div id="grid_container">
          <div id="yearsDashboard_grid" ref={yearsDashboardContainer}>
            {yearsShowing.map((year, index) => {
              return (
                <YearDashboard
                  year={year}
                  removeYear={removeYear}
                  key={year}
                  index={index}
                  nYears={yearsShowing.length}
                  // Song stuff:
                  addYearFromPlayingList={addYearFromPlayingList}
                  removeYearFromPlayingList={removeYearFromPlayingList}
                />
              );
            })}
          </div>
        </div>
        <div id="footer">
          <footer>
            <p>
              <a href="http://kauamelo.com"> kauã</a> - 2021
            </p>
          </footer>
        </div>
      </div>
    </Fragment>
  );
}

export default FullBoard;
