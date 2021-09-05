import "./css/menuYearsGrid.css";
import { Fragment, useEffect, useState, useRef } from "react";
import * as d3 from "d3";

function MenuYearsGrid(props) {
  // VARIABLES ==============================================================================
  // ========================================================================================
  // D3 object that we'll be using to add, remove,
  //  move, etc  all the visuals inside the <svg>
  const [d3Obj, setD3Obj] = useState(null);

  const svgElement = useRef(null); // ref to our SVG DOM element.

  // Menu Year Options Dimentions/Distances
  const yearLabelsNumberOfColumns = useState(10)[0];
  const yearLabelsMarginLeft = useState(0)[0];
  const yearLabelsGapBetweenYears = useState(5)[0];
  const yearLabelsMarginTop = useState(0)[0];

  // We are using 'useRef' here so we can access it from any d3.js function
  // that was created when the component was first created.
  const yearsShowingRef = useRef(props.yearsShowing);
  const typedYearInput = useRef(props.typedYearInput);

  // METHODS ================================================================================
  // ========================================================================================
  // typedYearInput changed.
  useEffect(() => {
    typedYearInput.current = props.typedYearInput;

    highlightPossibleYears(props.typedYearInput);
  }, [props.typedYearInput]);

  // sorting mode changed.
  useEffect(() => {
    sortYearsGrid();
  }, [props.sortingMode]);

  // props.yearOptions changed.
  useEffect(() => {
    const d3Obj_temp = d3
      .select(svgElement.current)
      .attr("width", "100%")
      .attr("height", 800)
      .attr("id", "menu_years_grid_svg");

    // Setting d3obj to state. We'll use it for
    //  any manipulation of the visuals.
    setD3Obj(d3Obj_temp);

    populateSvg();
  }, [props.yearOptions]);

  // props.yearsShowing changed.
  useEffect(() => {
    yearsShowingRef.current = props.yearsShowing;

    updateSvg();
    highlightPossibleYears(props.typedYearInput);
  }, [props.yearsShowing]);

  function isPossibleYear(year, input) {
    // Parameters: year = 1971, input = "19"
    // input = "19" and year = 1971 -> return true
    // input = "19" and year = 2008 -> return false

    // If input isn't an empty string.
    if (input) {
      let yearString = year.toString();
      yearString = yearString.slice(0, input.length);

      return input === yearString;
    }
    // If the input is an empty string.
    else {
      return false;
    }
  }

  function highlightPossibleYears(year) {
    // year = what the user typed. Ex: "1" or "19" or "198"...

    if (d3Obj) {
      // Repainting <rect>s
      d3Obj
        .selectAll(".menu_year_rect")
        .transition()
        .duration(400)
        .style("opacity", function (d) {
          if (
            !isPossibleYear(d.year, year) &&
            !props.yearsShowing.includes(d.year)
          ) {
            return 0;
          }
        })
        .style("fill", function (d) {
          // If this year is a possible year to be typed.
          if (isPossibleYear(d.year, year)) {
            // If the square is already selected
            if (props.yearsShowing.includes(d.year)) {
              return "rgb(54, 116, 224)";
            }
            // If the square wasn't selected yet.
            else {
              // Highlight it
              return "rgb(135, 135, 135)";
            }
          }
          // If this year doesn't match what the user typed.
          else {
            // If the square is already selected
            if (props.yearsShowing.includes(d.year)) {
              return "rgb(54, 116, 224)";
            }
            // If the square wasn't selected yet.
            else {
              // return "none";
              return "white";
            }
          }
        });

      // Repainting <text>s
      d3Obj
        .selectAll(".menu_year_text")
        .transition()
        .duration(400)
        .style("fill", function (d, i) {
          // If this year is a possible year to be typed.
          if (isPossibleYear(d.year, year)) {
            // Text white since background is gray
            return "rgb(255, 255, 255)";
          }
          // Not a possible year.
          else {
            // If the square is already selected
            if (props.yearsShowing.includes(d.year)) {
              return "rgb(255, 255, 255)";
            }
            // If the square wasn't selected yet.
            else {
              return "rgb(135, 135, 135)";
            }
          }
        });
    }
  }

  function sortYearsGrid() {
    if (d3Obj) {
      // Calculate rect width and height
      let svgWidth = svgElement.current.getBoundingClientRect().width;

      let rectWidth =
        (svgWidth -
          (yearLabelsNumberOfColumns - 1) * yearLabelsGapBetweenYears) /
        yearLabelsNumberOfColumns;

      let rectHeight = 0.55 * rectWidth;

      // Sorting mode -> year
      if (props.sortingMode === 1) {
        // sorting <g>s
        d3Obj
          .selectAll(".year_label_group")
          .sort(function (a, b) {
            return d3.descending(a.year, b.year);
          })
          .transition()
          .duration(2000)
          .attr("transform", function (d, i) {
            let posX =
              yearLabelsMarginLeft +
              (i % yearLabelsNumberOfColumns) *
                (rectWidth + yearLabelsGapBetweenYears);

            let posY =
              Math.floor(i / yearLabelsNumberOfColumns) *
                (rectHeight + yearLabelsGapBetweenYears) +
              yearLabelsMarginTop;

            return "translate(" + posX + ", " + posY + ")";
          });
      } else if (props.sortingMode === 2) {
        // sorting <g>s
        d3Obj
          .selectAll(".year_label_group")
          .sort(function (a, b) {
            return d3.ascending(a.avg, b.avg);
          })
          .transition()
          .duration(2000)
          .attr("transform", function (d, i) {
            let posX =
              yearLabelsMarginLeft +
              (i % yearLabelsNumberOfColumns) *
                (rectWidth + yearLabelsGapBetweenYears);

            let posY =
              Math.floor(i / yearLabelsNumberOfColumns) *
                (rectHeight + yearLabelsGapBetweenYears) +
              yearLabelsMarginTop;

            return "translate(" + posX + ", " + posY + ")";
          });
      }
    }
  }

  function updateSvg() {
    if (d3Obj) {
      // Repainting <rect>s
      d3Obj
        .selectAll(".menu_year_rect")
        .transition()
        .duration(100)
        .style("fill", function (d, i) {
          // If the year is selected
          if (props.yearsShowing.includes(d.year)) {
            return "rgb(54, 116, 224)";
          }
          // If the year isn't selected
          else {
            return "rgb(255, 255, 255)";
          }
        });

      // Repainting <text>s
      d3Obj
        .selectAll(".menu_year_text")
        .transition()
        .duration(100)
        .style("fill", function (d, i) {
          // If the year is selected
          if (props.yearsShowing.includes(d.year)) {
            return "rgb(255, 255, 255)";
          }
          // If the year isn't selected
          else {
            // return "rgb(255,255,255)";
            return "rgb(135, 135, 135)";
          }
        });
    }
  }

  function populateSvg() {
    if (d3Obj) {
      // Calculate rect width and height
      let svgWidth = svgElement.current.getBoundingClientRect().width;

      let rectWidth =
        (svgWidth -
          (yearLabelsNumberOfColumns - 1) * yearLabelsGapBetweenYears) /
        yearLabelsNumberOfColumns;
      let rectHeight = 0.55 * rectWidth;

      // Adding the g groups. Each will contain a <text> and a <rect>
      d3Obj
        .selectAll("g")
        .data(
          props.yearOptions.sort(function (m, n) {
            return d3.descending(m.year, n.year);
          })
        )
        .enter()
        .append("g")
        .attr("class", "year_label_group")
        .attr("year", function (d, i) {
          return d.year;
        })
        .attr("avg", function (d, i) {
          return d.avg;
        })
        .attr("transform", function (d, i) {
          let posX =
            yearLabelsMarginLeft +
            (i % yearLabelsNumberOfColumns) *
              (rectWidth + yearLabelsGapBetweenYears);

          let posY =
            Math.floor(i / yearLabelsNumberOfColumns) *
              (rectHeight + yearLabelsGapBetweenYears) +
            yearLabelsMarginTop;

          return "translate(" + posX + ", " + posY + ")";
        })
        .on("mouseover", function (d) {
          // Mouse cursor
          d3.select(this).style("cursor", "pointer");

          // If the year isn't already selected
          if (!yearsShowingRef.current.includes(d.year)) {
            // <rect>
            d3.select(this)
              .select("rect")
              .transition()
              .duration(10)
              .style("fill", "rgb(135, 135, 135)")
              .style("opacity", 1);

            // <text>
            d3.select(this)
              .select("text")
              .transition()
              .duration(10)
              .style("fill", "rgb(255, 255, 255)");
          }
        })
        .on("mouseout", function (d) {
          // If the year isn't already selected or it isn't highlithed
          //  because of the 'typedYearInput.current'
          if (
            !yearsShowingRef.current.includes(d.year) &&
            !isPossibleYear(d.year, typedYearInput.current)
          ) {
            // <rect>
            d3.select(this)
              .select("rect")
              .transition()
              .duration(400)
              // .style("fill", "none");
              .style("opacity", 0);

            // <text>
            d3.select(this)
              .select("text")
              .transition()
              .duration(400)
              .style("fill", "rgb(135, 135, 135)");
          }
        })
        .on("click", function () {
          props.addOrRemoveYear(
            parseInt(this.getAttribute("year")),
            this.getBoundingClientRect().y
          );
          // d3.select(this).select("rect").style("stroke", "white");
        });

      // Adding the <rect>s
      d3Obj
        .selectAll("g.year_label_group")
        .data(props.yearOptions)
        .append("rect")
        .attr("class", "menu_year_rect")
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("x", 0)
        .attr("y", 0)
        .attr("rx", 3)
        .attr("ry", 3)
        .style("stroke", "none")
        .attr("stroke-width", 0.5)
        .style("fill", "rgb(255,255,255)")
        .style("opacity", 0);

      // Adding the <text>s
      d3Obj
        .selectAll("g.year_label_group")
        .data(props.yearOptions)
        .append("text")
        .attr("class", "menu_year_text")
        .text(function (d) {
          return d.year;
        })
        .attr("x", function (d, i) {
          // Centralizing text -> (rect_width - text_width)/2
          return (rectWidth - this.getBoundingClientRect().width) / 2 - 2;
        })
        .attr("y", function (d, i) {
          let yearTextHeight = this.getBoundingClientRect().height;

          return yearTextHeight;
        });
      // .style("fill", "rgb(135, 135, 135)");
    }
  }

  return (
    <Fragment>
      <svg ref={svgElement}></svg>
    </Fragment>
  );
}

export default MenuYearsGrid;
