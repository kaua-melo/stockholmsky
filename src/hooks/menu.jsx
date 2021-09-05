import "./css/menu.css";
import { Fragment, useRef, useState, useEffect } from "react";
import MenuYearsGrid from "./menuYearsGrid";
import { getAllYearsAndAverage } from "../services/cloud_data_functions"; // To load data
import menuIcon from "../assets/icons/menuIcon1.svg";
import cloudP_menu_tooltip from "../assets/icons/cloudP_menu_tooltip.svg";

function Menu(props) {
  // VARIABLES ==============================================================================
  // ========================================================================================
  // The data [{year: 1756, avg: 58}, {year: 1757, avg: 78}, ... {} ]
  const [yearOptionsList, setYearOptionsList] = useState([]);
  const oldestYear = useRef(null); // The oldest year in the list.
  const newestYear = useRef(null); // The newest year in the list.

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

  // refs to DOM elements
  const menuContainerRef = useRef(null);
  const menuTogglerRef = useRef(null);
  const menuCloudPInfobox = useRef(null);
  const menuCloudPButton = useRef(null);
  const removeAllButton = useRef(null);
  const maxNYearAlertRef = useRef(null);
  const inputBox = useRef(null);

  // menuShowing = true -> the menu is open. So we can
  //  then listen to the keyboard.
  const [menuShowing, _setMenuShowing] = useState(false);
  const menuShowingRef = useRef(menuShowing);
  const setMenuShowing = (data) => {
    menuShowingRef.current = data;
    _setMenuShowing(data);
  };

  // 1 = sort by year,  2 = sort by cloud%
  const [sortingMode, setSortingMode] = useState(1);

  // Inputted Year on Menu
  const [typedYearInput, _setTypedYearInput] = useState("");
  const typedYearInputRef = useRef(typedYearInput);
  const setTypedYearInput = (data) => {
    typedYearInputRef.current = data;
    _setTypedYearInput(data);
  };

  // METHODS ================================================================================
  // ========================================================================================

  // When 'props.yearsShowing' changed.
  useEffect(() => {
    setYearsShowing(props.yearsShowing);

    // Show or hide the removeAllButton
    if (yearsShowingRef.current.length > 0) {
      // Show
      removeAllButton.current.style["opacity"] = "1";
      removeAllButton.current.style["visibility"] = "visible";
    } else {
      // Hide
      removeAllButton.current.style["opacity"] = "0";
      removeAllButton.current.style["visibility"] = "hidden";
    }
  }, [props.yearsShowing]);

  // 'Constructor'
  useEffect(() => {
    // setYearsShowing([props.year]);
    // setYearsShowing(props.yearsShowing);
    yearsShowingRef.current = props.yearsShowing;

    // Adding the keyboard event.
    window.addEventListener("keydown", handleKeyDown);

    // Loading the data
    async function getData() {
      const result = getAllYearsAndAverage();

      setYearOptionsList(result);

      oldestYear.current = result[0].year;
      newestYear.current = result[result.length - 1].year;

      // Fading in menu toggler
      setTimeout(function () {
        menuTogglerRef.current.style["opacity"] = 1;
      }, 10);
    }
    getData();

    // Executed when the component is destroyed.
    return () => {
      // Removing the keydown event.
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function isPossiblyAValidYear(input, firstYear, lastYear) {
    // Returns TRUE if the input contains numbers and
    //  the initial values are possible to be between the
    //  the years range passed as parameter.
    // Otherwise return FALSE.

    // Checking whether the 'input' string is a series of numbers.
    let isnum = /^\d+$/.test(input);

    if (isnum) {
      const year = parseInt(input);

      const min = Math.floor(firstYear / (0.1 * 10 ** (5 - input.length)));
      const max = Math.floor(lastYear / (0.1 * 10 ** (5 - input.length)));

      if (year >= min && year <= max) {
        return true;
      }
      return false;
    }

    // In case the input is not a number
    return false;
  }

  function handleKeyDown(event) {
    if (menuShowingRef.current) {
      // You can use: event.keyCode or event.key

      // Checking whether the key pressed is:
      //  .a number (0-9): event.keyCode >= 48 && event.keyCode <= 57
      //  .backspace: event.key === "Backspace"
      //  .enter -> event.keyCode = 13
      if (
        (event.keyCode >= 48 && event.keyCode <= 57) ||
        event.key === "Backspace" ||
        event.keyCode === 13
      ) {
        // BACKSPACE
        if (event.key === "Backspace") {
          // Let's remove the last character
          setTypedYearInput(typedYearInputRef.current.slice(0, -1));
        }
        // ENTER
        else if (event.keyCode === 13) {
          // If the input is a valid year and length = 4, let's select that year.
          if (typedYearInputRef.current.length === 4) {
            addOrRemoveYear(
              parseInt(typedYearInputRef.current),
              inputBox.current.getBoundingClientRect().y + 95
            );

            setTypedYearInput("");
          }
        }
        // NUMBER
        else {
          // We don't do anything if textInput already has a length of 4 or bigger.
          if (typedYearInputRef.current.length < 4) {
            // Valid input.
            if (
              isPossiblyAValidYear(
                typedYearInputRef.current + event.key,
                oldestYear.current,
                newestYear.current
              )
            ) {
              setTypedYearInput(typedYearInputRef.current + event.key);
            }
          }
        }
      }
    }
  }

  function handleMouseOverMenuToggler() {
    // Show the menu
    menuContainerRef.current.style["transform"] = "translateX(0)";
    // Hide the menuToggler
    menuTogglerRef.current.style["transform"] = "translateX(-100%)";

    // Set menuShowing so we can listen to the keyboard
    setMenuShowing(true);
  }

  function handleMouseOutMenuContainer() {
    // Hide the menu
    menuContainerRef.current.style["transform"] = "translateX(-105%)";
    // Bring the menuToggler back
    menuTogglerRef.current.style["transform"] = "translateX(0%)";

    // Set menuShowing to false so we can stop listening to the keyboard
    setMenuShowing(false);
  }

  function addOrRemoveYear(year, posY) {
    console.log("year: " + year);

    // If the year already exists in the array.
    if (yearsShowingRef.current.includes(year)) {
      console.log("Year already exists");

      props.removeYear(year);
    }
    // If the year isn't in the array.
    else {
      if (yearsShowingRef.current.length >= 2) {
        showMaxNYearAlert(posY - 50);
      } else {
        // let's add it
        props.addYear(year);
      }
    }
  }

  // Remove all years that are being displayed.
  function clearShowingYears() {
    // setYearsShowing([]);
    props.clearShowingYears();

    // Hide 'remove all' button.
    removeAllButton.current.style["opacity"] = "0";
    removeAllButton.current.style["visibility"] = "hidden";
  }

  function showClouPInforbox() {
    if (menuCloudPInfobox.current) {
      // Position infobox
      menuCloudPInfobox.current.style["left"] =
        menuCloudPButton.current.getBoundingClientRect().x + "px";
      menuCloudPInfobox.current.style["top"] =
        menuCloudPButton.current.getBoundingClientRect().y +
        25 +
        window.scrollY +
        "px";

      // Show
      menuCloudPInfobox.current.style["visibility"] = "visible";
      menuCloudPInfobox.current.style["opacity"] = 1;
    }
  }

  function hideShowCloudPInfobox() {
    if (menuCloudPInfobox.current) {
      menuCloudPInfobox.current.style["visibility"] = "hidden";
      menuCloudPInfobox.current.style["opacity"] = 0;
    }
  }

  function showMaxNYearAlert(posY) {
    maxNYearAlertRef.current.style["top"] =
      posY + menuContainerRef.current.scrollTop + "px";
    maxNYearAlertRef.current.style["transform"] = "translateX(81px)";

    // Waut a bit then hide the alert again.
    setTimeout(function () {
      maxNYearAlertRef.current.style["transform"] = "translateX(-103%)";
    }, 3500);
  }

  return (
    <Fragment>
      <div
        id="menu_toggler"
        onMouseOver={handleMouseOverMenuToggler}
        ref={menuTogglerRef}
      >
        <img src={menuIcon} id="menu_icon" alt=""></img>
      </div>

      <div
        id="menu_cloudP_infobox"
        ref={menuCloudPInfobox}
        onMouseOver={handleMouseOverMenuToggler}
        onMouseLeave={handleMouseOutMenuContainer}
        // onMouseEnter={showClouPInforbox}
        // onMouseLeave={function () {
        //   hideShowCloudPInfobox();
        //   handleMouseOutMenuContainer();
        // }}
      >
        <img src={cloudP_menu_tooltip} alt=""></img>
      </div>

      <div
        id="menu_container"
        ref={menuContainerRef}
        onMouseOver={handleMouseOverMenuToggler}
        onMouseLeave={handleMouseOutMenuContainer}
      >
        <div id="maximum_number_years_alert" ref={maxNYearAlertRef}>
          <p>You can add a maximum of two years.</p>
        </div>

        <div id="years_section">
          <div className="menu_input_container">
            <p id="years_title">Add a year: </p>

            <div className="input_box" ref={inputBox}>
              <p id="inputted_year"> {typedYearInput}</p>
              <span id="menu_year_input_caret">|</span>
            </div>
          </div>

          <div id="menu_years_grid_options">
            <div id="remove_all_div">
              <span
                id="remove_all"
                ref={removeAllButton}
                onClick={clearShowingYears}
              >
                remove all
              </span>
            </div>

            <div className="sorting_options_div">
              <span id="sort_by_menu">Sort by:</span>
              <span
                className={
                  sortingMode === 1
                    ? "sorting_option selectedSortingOption"
                    : "sorting_option"
                }
                id="menu_sort_by_year"
                onClick={() => setSortingMode(1)}
              >
                year
              </span>
              <span
                className={
                  sortingMode === 2
                    ? "sorting_option selectedSortingOption"
                    : "sorting_option"
                }
                id="menu_sort_by_cloudP"
                onClick={() => setSortingMode(2)}
                onMouseEnter={showClouPInforbox}
                onMouseLeave={hideShowCloudPInfobox}
                ref={menuCloudPButton}
              >
                cloud%
              </span>
            </div>
          </div>

          <MenuYearsGrid
            yearOptions={yearOptionsList}
            yearsShowing={yearsShowingRef.current}
            sortingMode={sortingMode}
            typedYearInput={typedYearInput}
            addOrRemoveYear={addOrRemoveYear}
          />
        </div>
        <div className="days_section"></div>
      </div>
    </Fragment>
  );
}

export default Menu;
