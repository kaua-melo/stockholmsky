import "./css/graphsBoard.css";
import * as d3 from "d3";
import * as Tone from "tone"; // tone.js to play audio :)

import { useEffect, useState, useRef, Fragment } from "react";

import s0 from "../services/samples/0.wav";
import s1 from "../services/samples/1.wav";
import s2 from "../services/samples/2.wav";
import s3 from "../services/samples/3.wav";
import s4 from "../services/samples/4.wav";
import s5 from "../services/samples/5.wav";
import s6 from "../services/samples/6.wav";
import s7 from "../services/samples/7.wav";
import s8 from "../services/samples/8.wav";
import s9 from "../services/samples/9.wav";
import s10 from "../services/samples/10.wav";
import s11 from "../services/samples/11.wav";
import s12 from "../services/samples/12.wav";
import s13 from "../services/samples/13.wav";

function GraphsBoard(props) {
  // This is the D3 object that we'll be using to add, remove,
  //  move, etc  all the visuals inside the <svg>
  const [d3Obj, setD3Obj] = useState(null);

  const [isSvgPopulated, setIsSvgPopulated] = useState(false);

  // DIMENTIONS
  // This will be update when the SVG is resized
  const [svgDimentions, setSvgDimentions] = useState(null);
  const recs = useRef({ width: 0, height: 0 });
  const gapBetweenMonths = useRef({ x: 0, y: 0 });
  const marginOnMonthConfig = useRef({
    left: 1,
    top: 80,
  });
  const gapBetweenPhotos = useRef(0.5);
  const [marginTopOnDateConfig, setMarginTopOnDateConfig] = useState(50);

  // Refs to HTML elements
  const svgGraphsBoard = useRef(null);
  const svgGraphsBoardContainer = useRef(null);
  const skyphotoInfobox = useRef(null);
  const zoomPhotoDiv = useRef(null);
  const zoomedImage = useRef(null);

  // FILTERING VALUES ------------
  // We are creating filterMinRef instead of just using props.filterMin because
  // this function has access only to the properties values that created this
  // component. We are using them in the populateSvg() function, under .on("mouseover")
  const [filterMin, _setFilterMin] = useState(props.filterMin);
  const filterMinRef = useRef(filterMin);
  const setFilterMin = (data) => {
    filterMinRef.current = data;
    _setFilterMin(data);
  };

  const [filterMax, _setFilterMax] = useState(props.filterMax);
  const filterMaxRef = useRef(filterMax);
  const setFilterMax = (data) => {
    filterMaxRef.current = data;
    _setFilterMax(data);
  };
  // -----------------------------

  // If someAnimationHappeningNow = true -> We can't do the filtering animation now, we wait.
  // If someAnimationHappeningNow = false -> We can do the filtering animation.
  const [someAnimationHappeningNow, _setSomeAnimationHappeningNow] =
    useState(false);
  const someAnimationHappeningNowRef = useRef(someAnimationHappeningNow);
  const setSomeAnimationHappeningNow = (data) => {
    someAnimationHappeningNowRef.current = data;
    _setSomeAnimationHappeningNow(data);
  };

  // We are using 'selectedMethodRef' because there are some function (such as
  //  on.("mouseover") ) that were created when this component was mounted, so the function
  //  has access only to the props.selectedMethod that created the component. If it later
  //  changes the function won't know. If we use selectedMethodRef.current it will always know.
  const selectedMethodRef = useRef(props.selectedMethod);

  const [infoboxDay, setInfoboxDay] = useState("");
  const [infoboxPCloud, setInfoboxPCloud] = useState("");
  const [zoomedPhotoURL, setZoomedPhotoURL] = useState();
  const [genericInfoboxMessage, setGenericInfoboxMessage] = useState("");

  //
  var svgResizer = useRef(null);

  // Visuals variables
  const monthNames = useState([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ])[0];
  const monthFullNames = useState([
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ])[0];
  // This will contain how many days each month has for this specific year.
  // It's important because there are years where february has 29 days instead
  //  of 28.
  const monthsLength = useRef({});

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
  const [photosInfo, setPhotosInfo] = useState(null);
  // "photosInfoCopy" is a copy of photosInfo. This will be used when we'll
  //   decide which photo to allocate on each day. We create a copy because
  //   we'll be removing the "id" from the array in the populateSvg function.
  //      {
  //       "percentage": 0,
  //       "ids": [0, 1, 2, 3, 4, 5, 6]
  //     }
  //  We do this so we repeat the images as little as possible.
  const [photosInfoCopy, setPhotosInfoCopy] = useState(null);

  // Sound ----------------------------------------------------------------------
  const [sequencer, _setSequencer] = useState(null);
  const sequencerRef = useRef(sequencer);
  const setSequencer = (data) => {
    sequencerRef.current = data;
    _setSequencer(data);
  };
  const [players, setPlayers] = useState(null);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  // ----------------------------------------------------------------------------

  // useEffects --------------------------------------------------
  // Component loaded
  useEffect(() => {
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
          // Making a copy of myJson
          setPhotosInfoCopy(JSON.parse(JSON.stringify(myJson)));
        });
    };
    getPhotosInfo();

    if (props.data.length) {
      // How many days does Jan have? And february, this year? We set that here :)
      setMonthsLength();

      // data: props.data
      // set up the svg
      const d3Obj_temp = d3
        .select(svgGraphsBoard.current)
        .attr("width", "100%")
        // .attr("height", 400)
        .attr("class", "D3Svg " + props.year);

      // Setting out d3obj to state. We'll use it for
      //  any manipulation of the visuals.
      setD3Obj(d3Obj_temp);

      // CALCULATING GRAPHICS DIMENTIONS
      // Saving the dimentions of the SVG and calculating all graphics dimentions.
      handleSvgResize();

      // Adding the ResizeObserver event.
      svgResizer.current = new ResizeObserver(handleSvgResize);
      svgResizer.current.observe(svgGraphsBoardContainer.current);

      // Executed when the component is destroyed.
      return () => {
        // Kill/disconnect the resize event when the component is destroyed.
        svgResizer.current.disconnect();

        // Deleting the sequencer
        sequencerRef.current.stop();
        sequencerRef.current.clear();
      };
    }

    // Creating the Tone players.
    // For some reason, if we define the players inside the useState() the
    //  app gets quite slow. So, that's why we are defining it here.
    setPlayers({
      p0: new Tone.Player(s0).toDestination(),
      p1: new Tone.Player(s1).toDestination(),
      p2: new Tone.Player(s2).toDestination(),
      p3: new Tone.Player(s3).toDestination(),
      p4: new Tone.Player(s4).toDestination(),
      p5: new Tone.Player(s5).toDestination(),
      p6: new Tone.Player(s6).toDestination(),
      p7: new Tone.Player(s7).toDestination(),
      p8: new Tone.Player(s8).toDestination(),
      p9: new Tone.Player(s9).toDestination(),
      p10: new Tone.Player(s10).toDestination(),
      p11: new Tone.Player(s11).toDestination(),
      p12: new Tone.Player(s12).toDestination(),
      p13: new Tone.Player(s13).toDestination(),
    });
  }, [props.data]);

  // d3 svg ('d3Obj') is ready to be populated.
  useEffect(() => {
    // console.log(" -- graphsBoard - useEffect 2: populating graphs");
    // The d3Obj is now all set. Time to populate it with data.
    populateSvg();
  }, [d3Obj, monthNames, photosInfo, photosInfoCopy, players]);

  // SYNTH / SONG
  useEffect(() => {
    // Once the svg is populated with everything, let's define the Synth behaviour.
    if (isSvgPopulated && players) {
      // Setting fadeIn and fadeOut to players so we avoid crackling
      //  audios when playing them in sequence.
      for (const [key, value] of Object.entries(players)) {
        players[key].fadeIn = 0.05;
        players[key].fadeOut = 0.05;
      }

      Tone.getContext().lookAhead = 0.09;

      // Defining our Synth behaviour:
      // Creating the sequencer loop -----------------------------------------------
      setSequencer(
        new Tone.Sequence(
          function (time, col) {
            // console.log("Bip.  time: " + time + "   col: " + col);

            // Get the photos (DOM element) of the current column
            var currentColumnPhotos = d3Obj.selectAll(".column-" + col)[0];
            // 'c_indexes' is the array with % of cloud of each photo of the current column.
            const c_indexes = [];
            // Looping through each photo and pushing its %cloud to the c_indexes array.
            currentColumnPhotos.forEach(function (photoElement, currentIndex) {
              c_indexes.push(
                parseInt(photoElement.attributes.c_index.nodeValue)
              );
            });

            const sum = c_indexes.reduce((a, b) => a + b, 0); // Sum of all c_indexes of the column.
            const avg = sum / c_indexes.length || 0; // Average c_index of the week.
            // console.log("Avg: " + avg);
            // PLAYING
            players["p" + parseInt((13 * avg) / 100)].start();

            // DRAWING
            // Updating visuals in sync with the audio should happen here.
            Tone.Draw.schedule(function () {
              // Highlight the current column
              d3Obj.selectAll(".column-" + col).attr("opacity", "0.4");

              // Highlight the column number
              d3Obj
                .selectAll(".weekNumber-" + (col + 1))
                .attr("fill", "rgb(54, 116, 224)");

              // De-highlight the previous column
              var previousColumn = col - 1;
              if (previousColumn === -1) {
                previousColumn = 52;
              }
              d3Obj.selectAll(".column-" + previousColumn).attr("opacity", "1");

              // De-highlight the previous column number
              d3Obj
                .selectAll(".weekNumber-" + (previousColumn + 1))
                .attr("fill", "rgb(170, 170, 170");
            }, time);
          },
          [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
            19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
            36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52,
          ], // The callback function "function (time, col)" will be called
          //  for every element of this array. Where "col" is the current element.
          //
          "0.45" // The duration the notes will be played in seconds.
        )
        //.start(0) // The delay it will take to start playing, in seconds.
      );
    }
  }, [isSvgPopulated, players]);

  // SVG is resized (so we can update all dimentions).
  useEffect(() => {
    // console.log(" -- graphsBoard - useEffect 3: updating graphs");
    // The d3Obj is now all set. Time to populate/update with data.
    updateGraphs();
  }, [svgDimentions]);

  // Filtering values changed.
  useEffect(() => {
    // you can now use: props.filterMin and props.filterMax.
    // console.log(" -- graphsBoard - useEffect 4: Filtering values changed!");
    setFilterMin(props.filterMin);
    setFilterMax(props.filterMax);

    if (d3Obj) {
      applyFiltering();
    }
  }, [props.filterMin, props.filterMax]);

  // Changed sorting method.
  useEffect(() => {
    // props.selectedMethod
    // 0 -> music is selected
    // 1 -> cloud %
    // 2 -> date
    // 3 -> month

    // We are setting 'selectedMethodRef' here because there are some function (such as
    //  on.("mouseover") ) that were created when this component was mounted, so the function
    //  has access only to the props.selectedMethod that created the component. If it later
    //  changes the function won't know. If we use selectedMethodRef.current it will always know.
    selectedMethodRef.current = props.selectedMethod;

    updateGraphs();
  }, [props.selectedMethod]);

  // ----------------------------------------------------------

  // =================================================================
  // SORTING MONTH STUFF
  // Recalculates all graphs dimentions for the Sorting: month
  function calculateGraphsSortMonth() {
    // Get the width of the svg that contains the SVG
    let svgWidth = svgGraphsBoard.current.getBoundingClientRect().width - 2;

    // Calculating the new rect width assuming that the
    //  distance between the months = rect + gapBetweenPhotos
    let newWidth = (svgWidth - 27 * gapBetweenPhotos.current) / 27;

    recs.current = { width: newWidth, height: 0.75 * newWidth };

    // Grid gap
    gapBetweenMonths.current = {
      x: recs.current.width + gapBetweenPhotos.current,
      y: 3 * (recs.current.height + gapBetweenPhotos.current),
    };
  }
  // This function does the logic to get the X position of the
  //  photo/rect on the Month configuration (sort: month).
  function getXPositionOnMonthConfig(month, i) {
    //
    // How many days have we plotted already until the previous month?
    // This will be useful for knowing how to distribute the
    //  squares in months. We'll need this logic becausse there are
    //  leap years, where the month of February has 29 days.
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }

    // let marginLeft = 0;
    // The column number of this month (1, 2, 3, or 4)
    let column = month - Math.floor((month - 0.1) / 4) * 4;
    // The width of the whole month
    let monthWidth = 6 * (recs.current.width + gapBetweenPhotos.current);

    return (
      // Position in relation to the month itself
      ((i - sumOfDaysPreviousMonth) % 6) *
        (recs.current.width + gapBetweenPhotos.current) +
      // Positioning in the canvas
      marginOnMonthConfig.current.left +
      // Adding the width of the months
      (column - 1) * monthWidth +
      // Adding the gaps between the months
      (column - 1) * gapBetweenMonths.current.x
    );
  }
  // This function does the logic to get the Y position of the
  //  photo/rect on the Month configuration (sort: month).
  function getYPositionOnMonthConfig(month, i) {
    //
    // How many days have we plotted already until the previous month?
    // This will be useful for knowing how to distribute the
    //  squares in months. We'll need this logic becausse there are
    //  leap years, where the month of February has 29 days.
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }

    // The line number of this month (1, 2, or 3)
    let line = Math.floor((month - 0.1) / 4) + 1;
    // The height of the whole month
    let monthHeight = 6 * (recs.current.height + gapBetweenPhotos.current);

    return (
      Math.floor((i - sumOfDaysPreviousMonth) / 6) *
        (recs.current.height + gapBetweenPhotos.current) +
      marginOnMonthConfig.current.top +
      (line - 1) * monthHeight +
      (line - 1) * gapBetweenMonths.current.y
    );
  }

  function sortMonth() {
    setSomeAnimationHappeningNow(true);

    calculateGraphsSortMonth();

    // Repositioning all photos.
    d3Obj
      .selectAll(".skyPhoto")
      // Sorting by day
      .sort(function (a, b) {
        // Sorting the photos by day

        return d3.ascending(a.day_number, b.day_number);
      })
      .transition()
      .duration(2000)
      // .style("opacity", 1)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        // d -> the data object:
        // d.c_index: 100
        // d.day: 31
        // d.day_number: 365
        // d.month: 12
        //
        // i -> index of the data [0-364]
        return getXPositionOnMonthConfig(d.month, i);
      })
      .attr("y", function (d, i) {
        return getYPositionOnMonthConfig(d.month, i);
      })
      .call(endAll, function () {
        // This will be executed when this animation is over.
        // The animation is now over
        setSomeAnimationHappeningNow(false);
        // Let's filter the grid just in case the user
        //  changed the filtering values while the animation
        //  was happening.
        applyFiltering();
      });

    // Repositioning all squares
    // Variables that will help calculating how many days fall withing the filtering range
    let currentMonth = 1;
    let sumOfDays = 0;
    let numberOfDaysShowing = [];
    //
    d3Obj
      .selectAll(".photoRect")
      // Sorting by day
      .sort(function (a, b) {
        // Sorting the photos by day
        return d3.ascending(a.day_number, b.day_number);
      })
      // We need to append the 'mouseover' and 'mouseout' event again since the previous
      //  one was for the other sorting methods.
      .on("mouseover", function (d, i) {
        // We show the infobox only for the photos which are not hidden (which
        //  fall within the filtering range).
        if (
          d.c_index >= filterMinRef.current &&
          d.c_index <= filterMaxRef.current
        ) {
          mouseOverPhotoSortingMonth(d, i, this);
        }
      })
      .on("mouseout", function (d, i) {
        mouseOutPhotoSortingMonth(d, i, this);
      })
      .transition()
      .duration(2000)
      .attr("width", function () {
        // return newWidth;
        // return recs.current.width - 0.5;
        return recs.current.width + 0.5;
      })
      .attr("height", function () {
        // return 0.75 * newWidth;
        // return recs.current.height - 0.5;
        return recs.current.height + 0.5;
      })
      .attr("x", function (d, i) {
        // d -> the data object:
        // d.c_index: 100
        // d.day: 31
        // d.day_number: 365
        // d.month: 12
        //
        // i -> index of the data [0-364]
        return getXPositionOnMonthConfig(d.month, i) - 0.15;
      })
      .attr("y", function (d, i) {
        return getYPositionOnMonthConfig(d.month, i) - 0.1;
      })
      // We do the following just to calculate how many days
      //  falls withing the filtering range.
      .attr("aux", function (d) {
        if (d.c_index >= props.filterMin && d.c_index <= props.filterMax) {
          if (d.month === currentMonth) {
            sumOfDays += 1;
          } else {
            currentMonth += 1;
            numberOfDaysShowing.push(sumOfDays);
            sumOfDays = 1;
          }
        } else {
          if (d.month !== currentMonth) {
            currentMonth += 1;
            numberOfDaysShowing.push(sumOfDays);
            sumOfDays = 0;
          }
        }
      });
    numberOfDaysShowing.push(sumOfDays);

    // Repositioning month labels
    d3Obj
      .selectAll(".monthLabel")
      .transition()
      .duration(2000)
      .attr("x", function (d, i) {
        // d -> month name 'Jan', 'Fev', 'Mar' etc...
        // i -> month number (0-11)

        // What's the day number of the first day of this month?
        let sumOfDaysPreviousMonth = 0;
        for (let m = 1; m < i + 1; m++) {
          sumOfDaysPreviousMonth += monthsLength.current[m];
        }

        return getXPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth);
      })
      .attr("y", function (d, i) {
        // d -> month name 'Jan', 'Fev', 'Mar' etc...
        // i -> month number (0-11)

        // What's the day number of the first day of this month?
        let sumOfDaysPreviousMonth = 0;
        for (let m = 1; m < i + 1; m++) {
          sumOfDaysPreviousMonth += monthsLength.current[m];
        }

        return getYPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth) - 10;
      })
      .attr("fill", "rgb(108, 108, 108)");

    // Repositioning number of days that fall within the range.
    d3Obj
      .selectAll(".month_NDaysWithinRange")
      .transition()
      .duration(2000)
      .attr("x", function (d, i) {
        // d -> month name 'Jan', 'Fev', 'Mar' etc...
        // i -> month number (0-11)

        // What's the day number of the first day of this month?
        let sumOfDaysPreviousMonth = 0;
        for (let m = 1; m < i + 1; m++) {
          sumOfDaysPreviousMonth += monthsLength.current[m];
        }

        return (
          getXPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth + 5) +
          recs.current.width
        );
      })
      .attr("y", function (d, i) {
        // d -> month name 'Jan', 'Fev', 'Mar' etc...
        // i -> month number (0-11)

        // What's the day number of the first day of this month?
        let sumOfDaysPreviousMonth = 0;
        for (let m = 1; m < i + 1; m++) {
          sumOfDaysPreviousMonth += monthsLength.current[m];
        }
        return getYPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth) - 10;
      });

    showFilteringValues();
  }
  // =================================================================

  // =================================================================
  // SORTING DAY STUFF
  // Recalculates all graphs dimentions for the Sorting: date
  function calculateGraphsSortDate() {
    // Get the width of the svg that contains the SVG
    let svgWidth = svgGraphsBoard.current.getBoundingClientRect().width - 1;

    let monthMarginLeft = 0;
    // The width of the month labels (Jan, Feb, etc...)
    var monthLabelWidth = null;
    var monthLabelHeight = null;
    d3.select(".monthLabel")
      .filter(function (d, i) {
        return i === 0;
      })
      .style("width", function (d) {
        monthLabelWidth = this.getBoundingClientRect().width;
        monthLabelHeight = this.getBoundingClientRect().height;
      });
    // Distance between the grid and the month labels
    let gridMarginLeft = 50;
    // Distance between the grid and the right border of the SVG
    let marginRight = 0;

    // CALCULATING THE PHOTOS/RECS DIMENTIONS:
    let gridWidth =
      svgWidth -
      monthMarginLeft -
      monthLabelWidth -
      gridMarginLeft -
      marginRight;

    recs.current.width = (gridWidth - 19 * gapBetweenPhotos.current) / 20;
    recs.current.height = 0.75 * recs.current.width;

    // Calculating the vertical gap between the month labels.
    let gridHeight = 19 * recs.current.height + 18 * gapBetweenPhotos.current;
    let monthVerticalGap = (gridHeight - 12 * monthLabelHeight) / 11;

    // We return these values so we know where to draw the grid and month labels
    return {
      monthMarginLeft: monthMarginLeft,
      monthLabelWidth: monthLabelWidth,
      gridMarginLeft: gridMarginLeft + monthMarginLeft + monthLabelWidth,
      monthVerticalGap: monthVerticalGap,
      monthLabelHeight: monthLabelHeight,
    };
  }

  function sortDate() {
    setSomeAnimationHappeningNow(true);

    showFilteringValues();

    let distances = calculateGraphsSortDate();

    // Repositioning all photos.
    d3Obj
      .selectAll(".skyPhoto")
      // Sorting by day
      .sort(function (a, b) {
        // Sorting the photos by day
        return d3.ascending(a.day_number, b.day_number);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        return (
          distances.gridMarginLeft +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function (d, i) {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      })
      .call(endAll, function () {
        // This will be executed when this animation is over.
        // The animation is now over
        setSomeAnimationHappeningNow(false);
        // Let's filter the grid just in case the user
        //  changed the filtering values while the animation
        //  was happening.
        applyFiltering();
      });

    // Repositioning border rects
    d3Obj
      .selectAll(".photoRect")
      // Sorting by day
      .sort(function (a, b) {
        // Sorting the photos by day
        return d3.ascending(a.day_number, b.day_number);
      })
      // We need to append the 'mouseover' and 'mouseout' event again since the previous
      //  one was for the other sorting methods.
      .on("mouseover", function (d, i) {
        // We show the infobox only for the photos which are not hidden (which
        //  fall within the filtering range).
        if (
          d.c_index >= filterMinRef.current &&
          d.c_index <= filterMaxRef.current
        ) {
          mouseOverPhotoSortingDate(d, i, this);
        }
      })
      .on("mouseout", function (d, i) {
        mouseOutPhotoSortingDate(d, i, this);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        return (
          distances.gridMarginLeft +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function (d, i) {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      });

    // Repositioning monthLabels
    d3Obj
      .selectAll(".monthLabel")
      .transition()
      .duration(2000)
      .attr("x", function (d, i) {
        return distances.monthMarginLeft;
      })
      .attr("y", function (d, i) {
        return (
          marginTopOnDateConfig +
          i * (distances.monthVerticalGap + distances.monthLabelHeight) +
          distances.monthLabelHeight -
          2 // fine adjustment.
        );
      })
      .attr("fill", "rgb(170, 170, 170)");
  }
  // =================================================================

  // =================================================================
  // SORTING CLOUD% STUFF
  function sortCloudP() {
    // We are going to use the same 'recs' dimentions of sorting:date.
    // We'll just exclude the month labels and centralize the grid.

    setSomeAnimationHappeningNow(true);

    // Calculate the recs.current.width and height.
    calculateGraphsSortDate();

    // This is the margin to centralize the grid.
    let margin =
      (svgGraphsBoard.current.getBoundingClientRect().width -
        (20 * recs.current.width + 19 * gapBetweenPhotos.current)) /
      2;

    // Repositioning all photos
    d3Obj
      .selectAll(".skyPhoto")
      // Sorting by c_index
      .sort(function (a, b) {
        return d3.ascending(a.c_index, b.c_index);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        return (
          margin + (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function (d, i) {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      })
      .call(endAll, function () {
        // This will be executed when this animation is over.
        // The animation is now over
        setSomeAnimationHappeningNow(false);
        // Let's filter the grid just in case the user
        //  changed the filtering values while the animation
        //  was happening.
        applyFiltering();
      });

    // Repositioning border rects
    d3Obj
      .selectAll(".photoRect")
      // Sorting by c_index
      .sort(function (a, b) {
        return d3.ascending(a.c_index, b.c_index);
      })
      // We need to append the 'mouseover' and 'mouseout' event again since the previous
      //  one was for the other sorting methods.
      .on("mouseover", function (d, i) {
        // We show the infobox only for the photos which are not hidden (which
        //  fall within the filtering range).
        if (
          d.c_index >= filterMinRef.current &&
          d.c_index <= filterMaxRef.current
        ) {
          mouseOverPhotoSortingClouP(d, i, this);
        }
      })
      .on("mouseout", function (d, i) {
        mouseOutPhotoSortingClouP(d, i, this);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        return (
          margin + (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function (d, i) {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      });

    // Hide monthLabels
    d3Obj
      .selectAll(".monthLabel")
      .transition()
      .duration(1500)
      // .attr("x", -100);
      .attr("fill", "rgb(255, 255, 255)");

    showFilteringValues();
  }
  // =================================================================

  // =================================================================
  // PLAYING MUSIC STUFF
  // Calculates all graphs dimentions for the Sorting: Music
  function calculateGraphsSortMusic() {
    // Get the height of the svg that contains the SVG
    let svgHeight = svgGraphsBoard.current.getBoundingClientRect().height - 1;

    // The width of the month labels (Jan, Feb, etc...)
    var weekLabelWidth = null;
    var weekLabelHeight = null;
    d3.select(".weeksLabel")
      .filter(function (d, i) {
        return i === 0;
      })
      .style("width", function (d) {
        weekLabelWidth = this.getBoundingClientRect().width;
        weekLabelHeight = this.getBoundingClientRect().height;
      });

    // Distance between the grid and the weeksLabels
    let gridMarginLeft = 30;

    // The gap between the week blocks
    let weekblockVerticalGap = weekLabelHeight + 10;

    let gridHeight = svgHeight - 2 * weekblockVerticalGap; // 2 * weekblockVerticalGap -> top and bottom padding.

    // The expression below comes from this equation: 3*(7*recs.current.height) + 2*weekblockVerticalGap = gridHeight
    recs.current.height = (gridHeight - 2 * weekblockVerticalGap) / 21;
    recs.current.width = (1 / 0.75) * recs.current.height;

    let weekBlockHeight =
      7 * recs.current.height + 6 * gapBetweenPhotos.current;

    // Calculating the weekLabelMarginLeft:
    let svgWidth = svgGraphsBoard.current.getBoundingClientRect().width - 1;
    let gridWidth = 20 * recs.current.width + 19 * gapBetweenPhotos.current;
    // The expression below comes from:
    //   svgWidth = 2margins + weekLabelWidth + gridMarginLeft + gridWidth
    let weekLabelMarginLeft =
      (svgWidth - weekLabelWidth - gridMarginLeft - gridWidth) / 2;

    // We return these values so we know where to draw the grid and weeksLabels
    return {
      gridMarginLeft: gridMarginLeft + weekLabelMarginLeft + weekLabelWidth,
      weekblockVerticalGap: weekblockVerticalGap,
      weekBlockHeight: weekBlockHeight,
      weekLabelMarginLeft: weekLabelMarginLeft,
    };
  }

  function sortMusic() {
    // alert("We are going to play music now!");
    setSomeAnimationHappeningNow(true);

    var distances = calculateGraphsSortMusic();

    // Repositioning all photos
    d3Obj
      .selectAll(".skyPhoto")
      // Sorting by day_number
      .sort(function (a, b) {
        return d3.ascending(a.day_number, b.day_number);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        // If lineBlock == 0  ->  this photo is on the first week block line.
        // If lineBlock == 1  ->  this photo is on the second week block line.
        // If lineBlock == 2  ->  this photo is on the third week block line.
        var lineBlock = parseInt(i / (7 * 20));
        var marginLeft = distances.gridMarginLeft;

        // First line block
        if (lineBlock === 0) {
          return (
            marginLeft +
            parseInt(i / 7) * (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Second line block
        else if (lineBlock === 1) {
          return (
            marginLeft +
            parseInt((i - 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Third line block
        else if (lineBlock === 2) {
          return (
            marginLeft +
            parseInt((i - 2 * 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
      })
      .attr("y", function (d, i) {
        return (
          // distances.weekblockVerticalGap / 2 + // Padding top of the SVG
          distances.weekblockVerticalGap + // Padding top of the SVG
          (i % 7) * recs.current.height +
          /* The line (week) block. 20 -> n of columns
                                    7  -> n of lines  */
          parseInt(i / (7 * 20)) *
            (distances.weekBlockHeight + distances.weekblockVerticalGap)
        );
      })
      .call(endAll, function () {
        // This will be executed when this animation is over.
        // The animation is now over
        setSomeAnimationHappeningNow(false);
        // Let's filter the grid just in case the user
        //  changed the filtering values while the animation
        //  was happening.
        applyFiltering();

        // Let's add this year to the yearsPlaying array.
        props.addYearFromPlayingList(props.year);

        // Let's start playing the audio:
        // If we are not already playing something.
        if (Tone.Transport.state === "stopped") {
          // We need to position the Tone.Transport to 0
          Tone.Transport.position = 0;

          // And start it.
          // Tone.Transport.start(0);
          Tone.Transport.start();

          // Now let's play our sequencer.
          // sequencer.start(0);
          sequencer.start(Tone.Transport.progress);
        }
        // If we are already playing something
        else if (Tone.Transport.state === "started") {
          sequencer.start();
        }

        setIsPlayingSound(true);
      });

    // Repositioning border rects
    d3Obj
      .selectAll(".photoRect")
      // Sorting by day_number
      .sort(function (a, b) {
        return d3.ascending(a.day_number, b.day_number);
      })
      // We need to append the 'mouseover' and 'mouseout' event again since the previous
      //  one was for the other sorting methods.
      .on("mouseover", function (d, i) {
        // We show the infobox only for the photos which are not hidden (which
        //  fall within the filtering range).
        if (
          d.c_index >= filterMinRef.current &&
          d.c_index <= filterMaxRef.current
        ) {
          mouseOverPhotoSortingMusic(d, i, this);
        }
      })
      .on("mouseout", function (d, i) {
        mouseOutPhotoSortingMusic(d, i, this);
      })
      .transition()
      .duration(2000)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (d, i) {
        // If lineBlock == 0  ->  this rect is on the first week block line.
        // If lineBlock == 1  ->  this rect is on the second week block line.
        // If lineBlock == 2  ->  this rect is on the third week block line.
        var lineBlock = parseInt(i / (7 * 20));
        var marginLeft = distances.gridMarginLeft;

        // First line block
        if (lineBlock === 0) {
          return (
            marginLeft +
            parseInt(i / 7) * (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Second line block
        else if (lineBlock === 1) {
          return (
            marginLeft +
            parseInt((i - 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Third line block
        else if (lineBlock === 2) {
          return (
            marginLeft +
            parseInt((i - 2 * 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
      })
      .attr("y", function (d, i) {
        return (
          // distances.weekblockVerticalGap / 2 + // Padding top of the SVG
          distances.weekblockVerticalGap + // Padding top of the SVG
          (i % 7) * recs.current.height +
          /* The line (week) block. 20 -> n of columns
                                    7  -> n of lines  */
          parseInt(i / (7 * 20)) *
            (distances.weekBlockHeight + distances.weekblockVerticalGap)
        );
      });

    // Positioning weeks labels
    d3Obj
      .selectAll(".weeksLabel")
      .transition()
      .duration(2000)
      // .style("opacity", 1)
      .attr("opacity", "1")
      .attr("x", function (d, i) {
        return distances.weekLabelMarginLeft;
      })
      .attr("y", function (d, i) {
        return (
          distances.weekblockVerticalGap +
          i * (distances.weekBlockHeight + distances.weekblockVerticalGap) -
          7
        );
      });

    // Positioning week numbers
    d3Obj
      .selectAll(".weekNumber")
      .transition()
      .duration(2000)
      // .style("opacity", 1)
      .attr("opacity", "1")
      .attr("x", function (d, i) {
        return (
          distances.gridMarginLeft +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current) +
          recs.current.width / 2
        );
      })
      .attr("y", function (d, i) {
        // If lineBlock == 0  ->  this number is on the first week block line.
        // If lineBlock == 1  ->  this number is on the second week block line.
        // If lineBlock == 2  ->  this number is on the third week block line.
        var lineBlock = parseInt(i / 20);

        return (
          distances.weekblockVerticalGap +
          lineBlock *
            (distances.weekBlockHeight + distances.weekblockVerticalGap) -
          7
        );
      });

    showFilteringValues();
  }
  // =================================================================
  function applyFiltering() {
    if (d3Obj && !someAnimationHappeningNowRef.current) {
      // Hiding the photos that don't fall in the filtering range.
      d3Obj
        .selectAll(".skyPhoto")
        .transition()
        .duration(800)
        .attr("opacity", function (d) {
          // if (d.c_index >= props.filterMin && d.c_index <= props.filterMax) {
          if (
            d.c_index >= filterMinRef.current &&
            d.c_index <= filterMaxRef.current
          ) {
            return "1";
          } else {
            return "0";
          }
        });
      // .style("opacity", function (d) {
      //   // if (d.c_index >= props.filterMin && d.c_index <= props.filterMax) {
      //   if (
      //     d.c_index >= filterMinRef.current &&
      //     d.c_index <= filterMaxRef.current
      //   ) {
      //     return 1;
      //   } else {
      //     return 0;
      //   }
      // });

      // Showing the rect border of the photos that were hidden.
      d3Obj
        .selectAll(".photoRect")
        .transition()
        .duration(800)
        .style("stroke-opacity", function (d, i) {
          // if (d.c_index >= props.filterMin && d.c_index <= props.filterMax) {
          if (
            d.c_index >= filterMinRef.current &&
            d.c_index <= filterMaxRef.current
          ) {
            return 0;
          }
          // Showing the rect border
          else {
            return 1;
          }
        });

      showFilteringValues();
    }
  }

  function showFilteringValues() {
    // Counting the number of days that fall within the filtering range.
    // ---------------------------------------------------------------------
    let currentMonth = 1;
    let sumOfDaysThisMonth = 0;
    let numberOfDaysShowing = [];

    d3Obj.selectAll(".photoRect").attr("aux", function (d, i) {
      // This day fall within the filtering range.
      if (d.c_index >= props.filterMin && d.c_index <= props.filterMax) {
        if (d.month === currentMonth) {
          sumOfDaysThisMonth += 1;
        } else {
          currentMonth += 1;
          numberOfDaysShowing.push(sumOfDaysThisMonth);
          sumOfDaysThisMonth = 1;
        }
      }
      // This day doesn't fall within the filtering range.
      else {
        if (d.month !== currentMonth) {
          currentMonth += 1;
          numberOfDaysShowing.push(sumOfDaysThisMonth);
          sumOfDaysThisMonth = 0;
        }
      }
    });
    // Array with N days withing the filtering range for each month
    numberOfDaysShowing.push(sumOfDaysThisMonth);
    // ---------------------------------------------------------------------

    // Sorting -> cloud%
    if (props.selectedMethod === 1) {
      // Hide the number of days for each month that fall within the range.
      d3Obj
        .selectAll(".month_NDaysWithinRange")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide the weekLabel
      d3Obj
        .selectAll(".weeksLabel")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide week numbers
      d3Obj
        .selectAll(".weekNumber")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // 'numberOfDaysShowing' is an array with the number of days withing the range
      //   for each month. 'numberDaysThatFallsTheRange' is the sum of all days.
      let numberDaysThatFallsTheRange = numberOfDaysShowing.reduce(
        (a, b) => a + b,
        0
      );
      let percentageDaysWithingRange = Math.round(
        ((numberDaysThatFallsTheRange * 100) / props.data.length) * 100
      );
      percentageDaysWithingRange = Math.round(percentageDaysWithingRange / 100);

      // Showing the % of the year that falls within the filtering range.
      d3Obj
        .select(".percentage_year_withing_range")
        .text(function (d, i) {
          return percentageDaysWithingRange + "%";
        })
        .transition()
        .duration(2000)
        .attr("opacity", function () {
          if (props.filterMin === 0 && props.filterMax === 100) {
            return "0";
          }
          return "1";
        })
        // .style("opacity", function () {
        //   if (props.filterMin === 0 && props.filterMax === 100) {
        //     return 0;
        //   }
        //   return 1;
        // })
        .attr("x", function (d, i) {
          // This is the margin to centralize the grid.
          let margin =
            (svgGraphsBoard.current.getBoundingClientRect().width -
              (20 * recs.current.width + 19 * gapBetweenPhotos.current)) /
            2;

          return svgGraphsBoard.current.getBoundingClientRect().width - margin;
        })
        .attr("y", function (d, i) {
          return marginTopOnDateConfig - 10;
        });
    }
    // Sorting -> date
    else if (props.selectedMethod === 2) {
      // Hide the number of days for each month that fall within the range.
      d3Obj
        .selectAll(".month_NDaysWithinRange")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide the weekLabel
      d3Obj
        .selectAll(".weeksLabel")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide week numbers
      d3Obj
        .selectAll(".weekNumber")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // 'numberOfDaysShowing' is an array with the number of days withing the range
      //   for each month. 'numberDaysThatFallsTheRange' is the sum of all days.
      let numberDaysThatFallsTheRange = numberOfDaysShowing.reduce(
        (a, b) => a + b,
        0
      );
      let percentageDaysWithingRange = Math.round(
        ((numberDaysThatFallsTheRange * 100) / props.data.length) * 100
      );
      percentageDaysWithingRange = Math.round(percentageDaysWithingRange / 100);
      // percentageDaysWithingRange *= 100;

      // Showing the % of the year that falls within the filtering range.
      d3Obj
        .select(".percentage_year_withing_range")
        .text(function (d, i) {
          return percentageDaysWithingRange + "%";
        })
        .transition()
        .duration(2000)
        .attr("opacity", function () {
          if (props.filterMin === 0 && props.filterMax === 100) {
            return "0";
          }
          return "1";
        })
        // .style("opacity", function () {
        //   if (props.filterMin === 0 && props.filterMax === 100) {
        //     return 0;
        //   }
        //   return 1;
        // })
        .attr("x", function (d, i) {
          return svgGraphsBoard.current.getBoundingClientRect().width;
        })
        .attr("y", function (d, i) {
          return marginTopOnDateConfig - 10;
        });
    }
    // Sorting -> month
    else if (props.selectedMethod === 3) {
      // Hide the % of the year that falls within the filtering range.
      d3Obj
        .select(".percentage_year_withing_range")
        .transition()
        .duration(2000)
        .style("opacity", 0);

      // Hide the weekLabel
      d3Obj
        .selectAll(".weeksLabel")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide week numbers
      d3Obj
        .selectAll(".weekNumber")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Showing the number of days that fall within the range.
      d3Obj
        .selectAll(".month_NDaysWithinRange")
        .text(function (d, i) {
          return numberOfDaysShowing[i];
        })
        .transition()
        .duration(2000)
        .attr("opacity", function () {
          if (props.filterMin === 0 && props.filterMax === 100) {
            return "0";
          }
          return "1";
        })
        // .style("opacity", function () {
        //   if (props.filterMin === 0 && props.filterMax === 100) {
        //     return 0;
        //   }
        //   return 1;
        // })
        .attr("x", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return (
            getXPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth + 5) +
            recs.current.width
          );
        })
        .attr("y", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return getYPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth) - 10;
        });
    }
    // Sorting -> music
    else if (props.selectedMethod === 0) {
      // Hide the % of the year that falls within the filtering range.
      d3Obj
        .select(".percentage_year_withing_range")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);

      // Hide monthLabels
      d3Obj
        .selectAll(".monthLabel")
        .transition()
        .duration(2000)
        // .attr("x", -100);
        .attr("fill", "rgb(255, 255, 255)");

      // Hide the number of days for each month that fall within the range.
      d3Obj
        .selectAll(".month_NDaysWithinRange")
        .transition()
        .duration(2000)
        .attr("opacity", "0");
      // .style("opacity", 0);
    }
  }

  // Executed every time the SVG is resized.
  function handleSvgResize() {
    if (svgGraphsBoard.current) {
      // The SVG was resized!
      // Get the width of the svg that contains the SVG
      let svgWidth = svgGraphsBoard.current.getBoundingClientRect().width;

      //
      // Let's recalculate all graphs distances and dimentions.
      // Rect/photo dimentions
      // let f = 0.035;
      // let newRectWidth = f * svgWidth;
      // let newRectHeight = 0.75 * newRectWidth;
      //     recs.current = { width: newRectWidth, height: newRectHeight };

      // IF SORTING = month
      calculateGraphsSortMonth();

      //
      // SVG stuff
      // Let's update its dimentions
      if (svgGraphsBoard.current) {
        let newSvgHeight =
          1 * marginOnMonthConfig.current.top + // Margin top
          10 + // Margin bottom
          2 * gapBetweenMonths.current.y +
          3 * (6 * (recs.current.height + gapBetweenPhotos.current));

        setSvgDimentions({
          width: svgGraphsBoard.current.getBoundingClientRect().width,
          // height: svgGraphsBoard.current.getBoundingClientRect().height,
          height: newSvgHeight,
        });

        // resize SVG
        svgGraphsBoard.current.style["height"] = newSvgHeight + "px";
      }

      // Font sizes
      // etc...
    }
  }

  function populateSvg() {
    if (d3Obj && photosInfo && photosInfoCopy) {
      // Adding month labels
      d3Obj
        .selectAll("text")
        .data(monthNames)
        .enter()
        .append("text")
        .attr("class", "monthLabel")
        .text(function (d) {
          return d;
        })
        .attr("font-family", "Poppins_light")
        .attr("fill", "rgb(108, 108, 108")
        // .attr("x", 10)
        // .attr("y", function (d, i) {
        //   return 20 + i * 33.5;
        // });
        .attr("x", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return getXPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth);
        })
        .attr("y", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return getYPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth) - 10;
        })
        .on("mouseover", function (d, i) {
          // d = "Jan", "Fev", ...
          // i = [0, ..., 11]

          // sorting:date
          if (selectedMethodRef.current === 2) {
            // Turning the label darker
            d3.select(this)
              .transition()
              .duration(300)
              .attr("fill", "rgb(108,108,108)");

            // The cursor should not change
            d3.select(this).style("cursor", "default");

            let distances = calculateGraphsSortDate();

            let newWidth = 0.4 * recs.current.width;
            let newHeight = 0.4 * recs.current.height;

            //
            d3Obj
              .selectAll(".skyPhoto, .photoRect")
              .filter(function (d) {
                // d = {day_number: 365, day: 31, c_index: 100, month: 12}
                if (d.month !== i + 1) {
                  return true;
                }
                return false;
              })
              .transition()
              .duration(600)
              .attr("width", newWidth)
              .attr("height", newHeight)
              .attr("x", function (d2, i2) {
                return (
                  distances.gridMarginLeft +
                  ((d2.day_number - 1) % 20) *
                    (recs.current.width + gapBetweenPhotos.current) -
                  (newWidth - recs.current.width) / 2
                );
              })
              .attr("y", function (d2) {
                return (
                  Math.floor((d2.day_number - 1) / 20) *
                    (recs.current.height + gapBetweenPhotos.current) +
                  marginTopOnDateConfig -
                  (newHeight - recs.current.height) / 2
                );
              });
          }
        })
        .on("mouseout", function (d, i) {
          // sorting:date
          if (selectedMethodRef.current === 2) {
            // Turning the label lighter
            d3.select(this)
              .transition()
              .duration(300)
              .attr("fill", "rgb(170, 170, 170)");

            let distances = calculateGraphsSortDate();

            //
            d3Obj
              .selectAll(".skyPhoto, .photoRect")
              .filter(function (d) {
                // d = {day_number: 365, day: 31, c_index: 100, month: 12}
                if (d.month !== i + 1) {
                  return true;
                }
                return false;
              })
              .transition()
              .duration(600)
              .attr("width", recs.current.width)
              .attr("height", recs.current.height)
              .attr("x", function (d2) {
                return (
                  distances.gridMarginLeft +
                  ((d2.day_number - 1) % 20) *
                    (recs.current.width + gapBetweenPhotos.current)
                );
              })
              .attr("y", function (d2) {
                return (
                  Math.floor((d2.day_number - 1) / 20) *
                    (recs.current.height + gapBetweenPhotos.current) +
                  marginTopOnDateConfig
                );
              });
          }
        });

      // Adding number of days that fall within the range
      d3Obj
        .selectAll()
        .data(monthNames)
        .enter()
        .append("text")
        .attr("class", "month_NDaysWithinRange")
        .text("")
        .attr("text-anchor", "end")
        .attr("x", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return (
            getXPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth + 5) +
            recs.current.width
          );
        })
        .attr("y", function (d, i) {
          // d -> month name 'Jan', 'Fev', 'Mar' etc...
          // i -> month number (0-11)
          // What's the day number of the first day of this month?
          let sumOfDaysPreviousMonth = 0;
          for (let m = 1; m < i + 1; m++) {
            sumOfDaysPreviousMonth += monthsLength.current[m];
          }
          return getYPositionOnMonthConfig(i + 1, sumOfDaysPreviousMonth) - 10;
        })
        .attr("opacity", "0")
        // .style("opacity", 0)
        .attr("font-family", "Poppins_light")
        .attr("fill", "rgb(108, 108, 108")
        .on("mouseover", function (d, i) {
          // The cursor should not change
          d3.select(this).style("cursor", "default");

          // Show infobox only if there's some valid filtering range.
          if (!(filterMinRef.current === 0 && filterMaxRef.current === 100)) {
            // Defining infobox message:
            //   remove previous info
            setInfoboxDay("");
            setInfoboxPCloud("");
            //   set new message
            let numberDaysWithingRange = this.innerHTML;
            setGenericInfoboxMessage(
              "In " +
                monthFullNames[i] +
                ", " +
                numberDaysWithingRange +
                " days had a \u00A0%\u00A0 of cloud between: \u00A0" +
                filterMinRef.current +
                "% and " +
                filterMaxRef.current +
                "%."
            );

            // Position infobox
            let infoBoxPosX = this.getBoundingClientRect().x + window.scrollX;
            let infoBoxPosY =
              this.getBoundingClientRect().y +
              recs.current.height +
              3 +
              window.scrollY;
            //
            skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
            skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";

            // Show infobox
            skyphotoInfobox.current.style["visibility"] = "visible";
            skyphotoInfobox.current.style["opacity"] = 1;
          }
        })
        .on("mouseout", function (d, i) {
          // Hide infobox
          skyphotoInfobox.current.style["visibility"] = "hidden";
          skyphotoInfobox.current.style["opacity"] = 0;
        });

      // Adding % of the year that falls within the filtering range
      d3Obj
        .append("text")
        .attr("class", "percentage_year_withing_range")
        .text("")
        .attr("text-anchor", "end")
        .attr("x", function (d, i) {
          return svgGraphsBoard.current.getBoundingClientRect().width;
        })
        .attr("y", function (d, i) {
          return marginTopOnDateConfig - 10;
        })
        .attr("opacity", "0")
        // .style("opacity", 0)
        .attr("font-family", "Poppins_light")
        .attr("fill", "rgb(108, 108, 108")
        .on("mouseover", function (d, i) {
          // The cursor should not change
          d3.select(this).style("cursor", "default");

          // Show infobox only if there's some valid filtering range and sorting:date or sorting:cloud%
          if (
            !(filterMinRef.current === 0 && filterMaxRef.current === 100) &&
            (selectedMethodRef.current === 2 || selectedMethodRef.current === 1)
          ) {
            // Defining infobox message:
            //   remove previous info
            setInfoboxDay("");
            setInfoboxPCloud("");

            //   set new message
            let percYearWithingRange = this.innerHTML;
            setGenericInfoboxMessage(
              percYearWithingRange +
                " of the year had a \u00A0%\u00A0 of cloud between: \u00A0" +
                filterMinRef.current +
                "% and " +
                filterMaxRef.current +
                "%."
            );

            // Position infobox
            let infoBoxPosX =
              this.getBoundingClientRect().x + window.scrollX - 200;
            let infoBoxPosY =
              this.getBoundingClientRect().y +
              this.getBoundingClientRect().height +
              3 +
              window.scrollY;
            //
            skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
            skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";

            // Show infobox
            skyphotoInfobox.current.style["visibility"] = "visible";
            skyphotoInfobox.current.style["opacity"] = 1;
          }
        })
        .on("mouseout", function (d, i) {
          // Hide infobox
          skyphotoInfobox.current.style["visibility"] = "hidden";
          skyphotoInfobox.current.style["opacity"] = 0;
        });

      // We'll use 'distances' for positioning 'Week' and
      //  week numbers for the method:sort.
      var distances = calculateGraphsSortMusic();
      // Adding weeks labels
      d3Obj
        .selectAll(".weeksLabel")
        .data([0])
        .enter()
        .append("text")
        .attr("class", "weeksLabel")
        .text("Week:")
        .attr("font-family", "Poppins_light")
        .attr("fill", "rgb(170, 170, 170")
        .attr("opacity", "0")
        // .style("opacity", 0)
        .attr("x", function (d, i) {
          return 45;
        })
        .attr("y", function (d, i) {
          return 22.5;
        });

      // Adding weeks numbers
      d3Obj
        .selectAll(".weekNumber")
        .data(Array.from(Array(53).keys()))
        .enter()
        .append("text")
        .attr("class", function (d, i) {
          return "weekNumber" + " weekNumber-" + (i + 1);
        })
        .attr("text-anchor", "middle")
        .text(function (d, i) {
          return i + 1;
        })
        .attr("font-family", "Poppins_light")
        .attr("fill", "rgb(170, 170, 170")
        .attr("opacity", "0")
        // .style("opacity", 0)
        .attr("x", function (d, i) {
          return (
            distances.gridMarginLeft +
            (i % 20) * (recs.current.width + gapBetweenPhotos.current) +
            recs.current.width / 2
          );
        })
        .attr("y", function (d, i) {
          // If lineBlock == 0  ->  this number is on the first week block line.
          // If lineBlock == 1  ->  this number is on the second week block line.
          // If lineBlock == 2  ->  this number is on the third week block line.
          var lineBlock = parseInt(i / 20);

          return (
            distances.weekblockVerticalGap +
            lineBlock *
              (distances.weekBlockHeight + distances.weekblockVerticalGap) -
            7
          );
        });

      // Adding the photos.
      d3Obj
        .selectAll("image") // There's no 'rect' to select. But this is how we do to fill the svg with 'rects'.
        .data(props.data) // here we load the data
        .enter()
        .append("svg:image") // .enter().append() -> for each datapoint in the dataset, add an image.
        .attr("xlink:href", function (d) {
          // These variables will be useful for 'building' the name of the photo to be loaded.
          var photoId = null; // the id of the photo to be used.
          var photoCP = null; // the % of cloud of the photo to be used.

          // It might happen that in our database we don't have all %clouds (from 0 to 100%).
          // Here we get the closest %cloud available in our database to the c_index of the
          //  current datapoint.
          const closestPCloudAvailable = getClosestItem(
            d.c_index,
            photosInfoCopy["cloudPercentagesAvailable"]
          );
          photoCP = closestPCloudAvailable;

          // Checking if we still have some different picture available on that % of cloud.
          // photosPInfo = { "percentage": 0, "ids": [0, 1, 2, 3, 4, 5, 6] }
          var photosPInfo = photosInfoCopy["photos"].filter(
            (p) => p["percentage"] === closestPCloudAvailable
          )[0];

          // If there's still some different picture available
          if (photosPInfo["ids"].length > 0) {
            // Let's pick the first item (photo) available of the array
            photoId = photosPInfo["ids"][0];
            // And remove it form the array.
            photosPInfo["ids"] = photosPInfo["ids"].filter(function (value) {
              return value !== photoId;
            });
          }
          // If we don't have a different picture available with this % cloud that has not been
          //  used before. Let's pick a random picture.
          else {
            // Choosing a random picture
            // photosPInfo = { "percentage": 0, "ids": [0, 1, 2, 3, 4, 5, 6] }
            photosPInfo = photosInfo["photos"].filter(
              (p) => p["percentage"] === closestPCloudAvailable
            )[0];

            photoId =
              photosPInfo["ids"][
                Math.floor(Math.random() * photosPInfo["ids"].length)
              ];
          }

          return (
            process.env.PUBLIC_URL +
            "/photos/" +
            photoCP +
            "_" +
            photoId +
            "." +
            photosInfoCopy["imageExtension"]
          );

          // // Loading specific image according to its c_index.
          // if (d.c_index === 100) {
          //   return skyImages["s9"];
          // }
          // return skyImages["s" + Math.floor(d.c_index / 10)];
        })
        // .attr("class", "skyPhoto")
        .attr("class", function (d, i) {
          // We add the number of the column so we can manipulate
          //  the elements when playing the Synth.
          return "skyPhoto" + " column-" + parseInt(i / 7);
        })
        // .style("opacity", 0)
        .attr("width", recs.current.width)
        .attr("height", recs.current.height)
        // .attr("width", 0)
        // .attr("height", 0)
        .attr("x", function (d, i) {
          return getXPositionOnMonthConfig(d.month, i);
        })
        .attr("y", function (d, i) {
          return getYPositionOnMonthConfig(d.month, i);
        })
        .attr("c_index", function (d, i) {
          return d.c_index;
        })
        .attr("dayNumber", function (d) {
          return d.day_number;
        });

      // Adding one rectangle for each photo so we can add border to them.
      d3Obj
        .selectAll("rect")
        .data(props.data)
        .enter()
        .append("rect")
        .attr("class", "photoRect")
        // .attr("fill", "none")
        .attr("fill", "transparent")
        .attr("width", 0)
        .attr("height", 0)
        .attr("x", function (d, i) {
          // return -50;
          return getXPositionOnMonthConfig(d.month, i);
        })
        .attr("y", function (d, i) {
          // return -50;
          return getYPositionOnMonthConfig(d.month, i);
        })
        .attr("c_index", function (d, i) {
          return d.c_index;
        })
        .attr("dayNumber", function (d) {
          return d.day_number;
        })
        .style("stroke-opacity", 0) // set the stroke opacity
        .style("stroke", "rgb(108, 108, 108") // set the line colour
        .style("stroke-width", 0.3) // set the stroke width;
        .on("mouseover", function (d, i) {
          // We show the infobox only for the photos which are not hidden (which
          //  fall within the filtering range). We are using filterMinRef instead of
          //  props.filterMin because this function has access only to the properties
          //  values that created this component. If those properties change, this
          //  function still access only their first values.
          if (
            d.c_index >= filterMinRef.current &&
            d.c_index <= filterMaxRef.current
          ) {
            // sorting:month
            if (selectedMethodRef.current === 3) {
              mouseOverPhotoSortingMonth(d, i, this);
            }
            // sorting:date
            else if (selectedMethodRef.current === 2) {
              mouseOverPhotoSortingDate(d, i, this);
            }
            // sorting:cloud%
            else if (selectedMethodRef.current === 1) {
              mouseOverPhotoSortingClouP(d, i, this);
            }
          }
        })
        .on("mouseout", function (d, i) {
          // sorting:month
          if (selectedMethodRef.current === 3) {
            mouseOutPhotoSortingMonth(d, i, this);
          }
          // sorting:date
          else if (selectedMethodRef.current === 2) {
            mouseOutPhotoSortingDate(d, i, this);
          }
          // sorting:cloud%
          else if (selectedMethodRef.current === 1) {
            mouseOutPhotoSortingClouP(d, i, this);
          }
        })
        .on("click", function (d, i) {
          var photo = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
            return _d.day_number === d.day_number;
          })[0][0];

          // Setting the imageURL to be zoomed/displayed
          setZoomedPhotoURL(photo.href.baseVal);

          // The rect should teleport straight to the top of the photo to be zoomed, so
          //  'left' and 'top' should not be a transition when first moving to the top
          //  of the rect.
          let transitions =
            "width 0.8s, height 0.8s, visibility 1s, opacity 0.5s linear";
          zoomPhotoDiv.current.style["transition"] = transitions;
          zoomPhotoDiv.current.style["-webkit-transition"] = transitions;
          zoomPhotoDiv.current.style["-moz-transition"] = transitions;
          zoomPhotoDiv.current.style["-ms-transition"] = transitions;
          zoomPhotoDiv.current.style["-o-transition"] = transitions;

          // Positioning zoomPhotoDiv on top of skyPhoto that was clicked.
          zoomPhotoDiv.current.style["left"] =
            photo.getBoundingClientRect().left +
            (0.88 * recs.current.width - recs.current.width) / 2 +
            window.scrollX +
            "px";
          zoomPhotoDiv.current.style["top"] =
            photo.getBoundingClientRect().top +
            (0.88 * recs.current.height - recs.current.height) / 2 +
            window.scrollY +
            "px";

          // Turning the opacity back to 1
          zoomPhotoDiv.current.style["opacity"] = 1;
          zoomPhotoDiv.current.style["visibility"] = "visible";

          // Setting its dimentions to fit the <image>
          zoomPhotoDiv.current.style["width"] = recs.current.width + "px";
          zoomPhotoDiv.current.style["height"] = recs.current.height + "px";

          // If the browser has large width but small height
          if (window.innerWidth / window.innerHeight > 4 / 3) {
            console.log("Oi");
            zoomedImage.current.style["height"] = "90%";
            zoomedImage.current.style["width"] = "auto";
          } else {
            zoomedImage.current.style["width"] = "90%";
            zoomedImage.current.style["height"] = "auto";
          }

          // Growing/Zooming photo:
          setTimeout(function () {
            // Zooming transition time
            let transitions =
              "width 0.8s, height 0.8s, left 0.8s, top 0.8s, visibility 1s, opacity 0.5s linear";
            zoomPhotoDiv.current.style["transition"] = transitions;
            zoomPhotoDiv.current.style["-webkit-transition"] = transitions;
            zoomPhotoDiv.current.style["-moz-transition"] = transitions;
            zoomPhotoDiv.current.style["-ms-transition"] = transitions;
            zoomPhotoDiv.current.style["-o-transition"] = transitions;

            // Make zoomPhotoDiv occupy the entire screen.
            zoomPhotoDiv.current.style["left"] = 0 + window.scrollX + "px";
            zoomPhotoDiv.current.style["top"] = 0 + window.scrollY + "px";
            zoomPhotoDiv.current.style["width"] = "100%";
            zoomPhotoDiv.current.style["height"] = "100%";

            // body overflow: hidden -> avoid the possible scroll (getting out of the pic).
            document.body.style.overflow = "hidden";
          }, 50);
        });

      // By calling updateGraphs() here we make sure that we call the animation
      //  to sort the function:
      //      .call(endAll, function () {
      //      // This will be executed when this animation is over.
      //      // The animation is now over
      //      setSomeAnimationHappeningNow(false);
      //  so we can set the someAnimationHappeningNow back to false and therefore
      //  we can filter. Without this, we can't filter if that's our first action
      //  on the website. (if we try to filter before we click on any sorting option)
      updateGraphs();

      setIsSvgPopulated(true);
    }
  }

  // MouseOver and MouseOut functions ======================================
  // =======================================================================
  // MONTH
  function mouseOverPhotoSortingMonth(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Playing sound
    playDaySample(photoElement);

    // Cursor
    // d3.select(photoElement).style("cursor", "pointer");
    d3.select(rectElement).style("cursor", "pointer");

    let newWidth = 0.88 * recs.current.width;
    let newHeight = 0.88 * recs.current.height;
    d3.select(photoElement)
      .attr("width", newWidth)
      .attr("height", newHeight)
      .attr("x", function () {
        // Sorting:month
        return (
          getXPositionOnMonthConfig(d.month, i) -
          (newWidth - recs.current.width) / 2
        );
      })
      .attr("y", function () {
        return (
          getYPositionOnMonthConfig(d.month, i) -
          (newHeight - recs.current.height) / 2
        );
      });
    // Infobox: Changing the day and %cloud
    // How many days have we plotted already until the previous month?
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < d.month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }
    // Defining infobox info message
    //   remove previous info
    setGenericInfoboxMessage("");
    //   set new message
    setInfoboxDay(
      d.day_number - sumOfDaysPreviousMonth + " " + monthFullNames[d.month - 1]
    );
    setInfoboxPCloud(d.c_index + "% cloud");
    // Position and showing infobox
    let infoBoxPosX =
      photoElement.getBoundingClientRect().x +
      recs.current.width -
      10 +
      window.scrollX;
    let infoBoxPosY =
      photoElement.getBoundingClientRect().y +
      recs.current.height +
      4 +
      window.scrollY;
    skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
    skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";
    // Show infobox
    skyphotoInfobox.current.style["visibility"] = "visible";
    skyphotoInfobox.current.style["opacity"] = 1;
  }
  function mouseOutPhotoSortingMonth(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Cursor
    d3.select(photoElement).style("cursor", "default");

    d3.select(photoElement)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function () {
        return getXPositionOnMonthConfig(d.month, i);
      })
      .attr("y", function () {
        return getYPositionOnMonthConfig(d.month, i);
      });

    // Hide skyphoto Infobox
    skyphotoInfobox.current.style["visibility"] = "hidden";
    skyphotoInfobox.current.style["opacity"] = 0;
  }

  // DATE
  function mouseOverPhotoSortingDate(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Playing sound
    playDaySample(photoElement);

    // Cursor
    d3.select(rectElement).style("cursor", "pointer");

    var distances = calculateGraphsSortDate();

    let newWidth = 0.88 * recs.current.width;
    let newHeight = 0.88 * recs.current.height;
    d3.select(photoElement)
      .attr("width", newWidth)
      .attr("height", newHeight)
      .attr("x", function () {
        return (
          distances.gridMarginLeft +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current) -
          (newWidth - recs.current.width) / 2
        );
      })
      .attr("y", function () {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig -
          (newHeight - recs.current.height) / 2
        );
      });
    // Infobox: Changing the day and %cloud
    // How many days have we plotted already until the previous month?
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < d.month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }
    // Defining infobox info message
    //   remove previous info
    setGenericInfoboxMessage("");
    //   set new message
    setInfoboxDay(
      d.day_number - sumOfDaysPreviousMonth + " " + monthFullNames[d.month - 1]
    );
    setInfoboxPCloud(d.c_index + "% cloud");
    // Position and showing infobox
    let infoBoxPosX =
      photoElement.getBoundingClientRect().x +
      recs.current.width -
      10 +
      window.scrollX;
    let infoBoxPosY =
      photoElement.getBoundingClientRect().y +
      recs.current.height +
      4 +
      window.scrollY;
    skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
    skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";
    // Show infobox
    skyphotoInfobox.current.style["visibility"] = "visible";
    skyphotoInfobox.current.style["opacity"] = 1;
  }
  function mouseOutPhotoSortingDate(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Cursor
    d3.select(photoElement).style("cursor", "default");

    // Let's calculate the distances so we can use it
    //  to position the photos properly.
    var distances = calculateGraphsSortDate();

    d3.select(photoElement)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function () {
        return (
          distances.gridMarginLeft +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function () {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      });
    // Hide skyphoto Infobox
    skyphotoInfobox.current.style["visibility"] = "hidden";
    skyphotoInfobox.current.style["opacity"] = 0;
  }

  // CLOUD %
  function mouseOverPhotoSortingClouP(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Playing sound
    playDaySample(photoElement);

    // Cursor
    d3.select(rectElement).style("cursor", "pointer");

    // This is the margin to centralize the grid.
    let margin =
      (svgGraphsBoard.current.getBoundingClientRect().width -
        (20 * recs.current.width + 19 * gapBetweenPhotos.current)) /
      2;

    let newWidth = 0.88 * recs.current.width;
    let newHeight = 0.88 * recs.current.height;
    d3.select(photoElement)
      .attr("width", newWidth)
      .attr("height", newHeight)
      .attr("x", function () {
        return (
          margin +
          (i % 20) * (recs.current.width + gapBetweenPhotos.current) -
          (newWidth - recs.current.width) / 2
        );
      })
      .attr("y", function () {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig -
          (newHeight - recs.current.height) / 2
        );
      });

    // Infobox: Changing the day and %cloud
    // How many days have we plotted already until the previous month?
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < d.month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }
    // Defining infobox info message
    //   remove previous info
    setGenericInfoboxMessage("");
    //   set new message
    setInfoboxDay(
      d.day_number - sumOfDaysPreviousMonth + " " + monthFullNames[d.month - 1]
    );
    setInfoboxPCloud(d.c_index + "% cloud");
    // Position and showing infobox
    let infoBoxPosX =
      photoElement.getBoundingClientRect().x +
      recs.current.width -
      10 +
      window.scrollX;
    let infoBoxPosY =
      photoElement.getBoundingClientRect().y +
      recs.current.height +
      4 +
      window.scrollY;
    skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
    skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";
    // Show infobox
    skyphotoInfobox.current.style["visibility"] = "visible";
    skyphotoInfobox.current.style["opacity"] = 1;
  }
  function mouseOutPhotoSortingClouP(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Cursor
    d3.select(rectElement).style("cursor", "default");

    // This is the margin to centralize the grid.
    let margin =
      (svgGraphsBoard.current.getBoundingClientRect().width -
        (20 * recs.current.width + 19 * gapBetweenPhotos.current)) /
      2;

    d3.select(photoElement)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function () {
        return (
          margin + (i % 20) * (recs.current.width + gapBetweenPhotos.current)
        );
      })
      .attr("y", function () {
        return (
          Math.floor(i / 20) *
            (recs.current.height + gapBetweenPhotos.current) +
          marginTopOnDateConfig
        );
      });
    // Hide skyphoto Infobox
    skyphotoInfobox.current.style["visibility"] = "hidden";
    skyphotoInfobox.current.style["opacity"] = 0;
  }

  // MUSIC
  function mouseOverPhotoSortingMusic(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Playing sound
    playDaySample(photoElement);

    // Cursor
    d3.select(rectElement).style("cursor", "pointer");

    var distances = calculateGraphsSortMusic();

    let newWidth = 0.88 * recs.current.width;
    let newHeight = 0.88 * recs.current.height;
    d3.select(photoElement)
      .attr("width", newWidth)
      .attr("height", newHeight)
      .attr("x", function (_d, _i) {
        // If lineBlock == 0  ->  this photo is on the first week block line.
        // If lineBlock == 1  ->  this photo is on the second week block line.
        // If lineBlock == 2  ->  this photo is on the third week block line.
        var lineBlock = parseInt(i / (7 * 20));
        var marginLeft = distances.gridMarginLeft;

        // First line block
        if (lineBlock === 0) {
          return (
            marginLeft +
            parseInt(i / 7) * (recs.current.width + gapBetweenPhotos.current) -
            (newWidth - recs.current.width) / 2
          );
        }
        // Second line block
        else if (lineBlock === 1) {
          return (
            marginLeft +
            parseInt((i - 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current) -
            (newWidth - recs.current.width) / 2
          );
        }
        // Third line block
        else if (lineBlock === 2) {
          return (
            marginLeft +
            parseInt((i - 2 * 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current) -
            (newWidth - recs.current.width) / 2
          );
        }
      })
      .attr("y", function () {
        return (
          // distances.weekblockVerticalGap / 2 + // Padding top of the SVG
          distances.weekblockVerticalGap + // Padding top of the SVG
          (i % 7) * recs.current.height +
          /* The line (week) block. 20 -> n of columns
                                    7  -> n of lines  */
          parseInt(i / (7 * 20)) *
            (distances.weekBlockHeight + distances.weekblockVerticalGap) -
          (newHeight - recs.current.height) / 2
        );
      });

    // Infobox: Changing the day and %cloud
    // How many days have we plotted already until the previous month?
    let sumOfDaysPreviousMonth = 0;
    for (let m = 1; m < d.month; m++) {
      sumOfDaysPreviousMonth += monthsLength.current[m];
    }
    // Defining infobox info message
    //   remove previous info
    setGenericInfoboxMessage("");
    //   set new message
    setInfoboxDay(
      d.day_number - sumOfDaysPreviousMonth + " " + monthFullNames[d.month - 1]
    );
    setInfoboxPCloud(d.c_index + "% cloud");
    // Position and showing infobox
    let infoBoxPosX =
      photoElement.getBoundingClientRect().x +
      recs.current.width -
      10 +
      window.scrollX;
    let infoBoxPosY =
      photoElement.getBoundingClientRect().y +
      recs.current.height +
      4 +
      window.scrollY;
    skyphotoInfobox.current.style["left"] = infoBoxPosX + "px";
    skyphotoInfobox.current.style["top"] = infoBoxPosY + "px";
    // Show infobox
    skyphotoInfobox.current.style["visibility"] = "visible";
    skyphotoInfobox.current.style["opacity"] = 1;
  }
  function mouseOutPhotoSortingMusic(d, i, rectElement) {
    // A <rect> that triggers this function. Let's get the <image> 'associated'
    //  this <rect>.
    var photoElement = d3Obj.selectAll(".skyPhoto").filter(function (_d, _i) {
      return _d.day_number === d.day_number;
    })[0][0];

    // Cursor
    d3.select(rectElement).style("cursor", "default");

    var distances = calculateGraphsSortMusic();

    d3.select(photoElement)
      .attr("width", recs.current.width)
      .attr("height", recs.current.height)
      .attr("x", function (_d, _i) {
        // If lineBlock == 0  ->  this photo is on the first week block line.
        // If lineBlock == 1  ->  this photo is on the second week block line.
        // If lineBlock == 2  ->  this photo is on the third week block line.
        var lineBlock = parseInt(i / (7 * 20));
        var marginLeft = distances.gridMarginLeft;

        // First line block
        if (lineBlock === 0) {
          return (
            marginLeft +
            parseInt(i / 7) * (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Second line block
        else if (lineBlock === 1) {
          return (
            marginLeft +
            parseInt((i - 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
        // Third line block
        else if (lineBlock === 2) {
          return (
            marginLeft +
            parseInt((i - 2 * 7 * 20) / 7) *
              (recs.current.width + gapBetweenPhotos.current)
          );
        }
      })
      .attr("y", function () {
        return (
          // distances.weekblockVerticalGap / 2 + // Padding top of the SVG
          distances.weekblockVerticalGap + // Padding top of the SVG
          (i % 7) * recs.current.height +
          /* The line (week) block. 20 -> n of columns
                                  7  -> n of lines  */
          parseInt(i / (7 * 20)) *
            (distances.weekBlockHeight + distances.weekblockVerticalGap)
        );
      });

    // Hide skyphoto Infobox
    skyphotoInfobox.current.style["visibility"] = "hidden";
    skyphotoInfobox.current.style["opacity"] = 0;
  }
  // =======================================================================
  // =======================================================================

  function playDaySample(photoElement) {
    const c_index = photoElement.getAttribute("c_index");

    console.log(
      "state: " + players["p" + parseInt((13 * c_index) / 100)].state
    );
    console.log(
      "loaded: " + players["p" + parseInt((13 * c_index) / 100)].loaded
    );

    players["p" + parseInt((13 * c_index) / 100)].start();

    // if (players["p" + parseInt((13 * c_index) / 100)].state === "started") {
    //   // console.log("Yes");
    //   // players["p" + parseInt((13 * c_index) / 100)].stop();
    //   players["p" + parseInt((13 * c_index) / 100)].restart();
    // } else {
    //   // Play the sample
    //   players["p" + parseInt((13 * c_index) / 100)].start();
    // }
  }

  // This function will help you detect when an animation is
  //  over so you can perform another animation after that.
  // You'll need that for when the user filters while the photos
  //  are still moving.
  // https://gist.github.com/miguelmota/3faa2a2954f5249f61d9
  function endAll(transition, callback) {
    var n = 0;
    transition
      .each(() => ++n)
      .each("end", () => !--n && callback.apply(this, arguments));
  }

  function updateGraphs() {
    if (d3Obj) {
      // Sorting -> cloud%
      if (props.selectedMethod === 1) {
        // Maybe the previous method was sorting:music and therefore
        //  we are playing the music. In that case let's remove it.
        props.removeYearFromPlayingList(props.year);

        // If we are playing sound
        if (isPlayingSound) {
          // Let's stop the sequencer.
          stopSequencer();
        }

        sortCloudP();
      }
      // Sorting -> date
      else if (props.selectedMethod === 2) {
        // Maybe the previous method was sorting:music and therefore
        //  we are playing the music. In that case let's remove it.
        props.removeYearFromPlayingList(props.year);

        // If we are playing sound
        if (isPlayingSound) {
          // Let's stop the sequencer.
          stopSequencer();
        }

        sortDate();
      }
      // Sorting -> month
      else if (props.selectedMethod === 3) {
        // Maybe the previous method was sorting:music and therefore
        //  we are playing the music. In that case let's remove it.
        props.removeYearFromPlayingList(props.year);

        // If we are playing sound
        if (isPlayingSound) {
          // Let's stop the sequencer.
          stopSequencer();
        }

        sortMonth();
      }
      // Sorting -> music
      else if (props.selectedMethod === 0) {
        sortMusic();
      }
    }
  }

  function stopSequencer() {
    // Let's stop our sequencer.
    sequencer.stop();

    // De-highlight all column number
    d3Obj.selectAll(".weekNumber").attr("fill", "rgb(170, 170, 170");

    // Let's register that we are not playing anymore
    setIsPlayingSound(false);
  }

  function setMonthsLength() {
    // We need to check if the year is a leap year because in that case the month
    // of february has 29 days instead of 28. This will be essential for sorting
    // the months visually.

    if (props.data.length === 366) {
      monthsLength.current = {
        1: 31,
        2: 29, // February has 29 days in leap years
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
      };
    } else if (props.data.length === 365) {
      monthsLength.current = {
        1: 31,
        2: 28, // February has 28 days in non-leap years
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
      };
    }
  }

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

  function handleCloseZommedPhoto() {
    // Free the scroll
    document.body.style.overflow = "scroll";

    // Fadeout the zommPhotoDiv
    zoomPhotoDiv.current.style["opacity"] = 0;

    // We wait the fadeout to be complete
    setTimeout(function () {
      // Let's make it invisible so it doesn't avoid us hovering over anything
      zoomPhotoDiv.current.style["visibility"] = "hidden";

      // Setting the width of the zommPhotoDiv to the size of the photos.
      zoomPhotoDiv.current.style["width"] = recs.current.width + "px";
      zoomPhotoDiv.current.style["height"] = recs.current.height + "px";

      zoomPhotoDiv.current.style["transition"] =
        "visibility 1s, opacity 0.5s linear";
    }, 500);
  }

  return (
    <Fragment>
      {/* {console.log("-- graphsBoard - render")} */}
      <div className="svg_board_container" ref={svgGraphsBoardContainer}>
        <svg className="svg_graphs_board" ref={svgGraphsBoard}></svg>
        <div className="skyphoto_infobox" id={props.year} ref={skyphotoInfobox}>
          <p className="generic_infobox_message">{genericInfoboxMessage}</p>
          <p className="skyphoto_infobox_day">{infoboxDay}</p>
          <p className="skyphoto_infobox_pcloud">{infoboxPCloud}</p>
        </div>
        <div
          className="zoomed_photo"
          ref={zoomPhotoDiv}
          onClick={handleCloseZommedPhoto}
        >
          <p onClick={handleCloseZommedPhoto}>x</p>

          <img
            className="zommed_image"
            src={zoomedPhotoURL}
            alt=""
            ref={zoomedImage}
          ></img>
        </div>
      </div>
    </Fragment>
  );
}

export default GraphsBoard;
