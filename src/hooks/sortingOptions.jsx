import "./css/sortingOptions.css";

import { Fragment, memo } from "react";

// function SortingOptions(props) {
const SortingOptions = memo(function SortingOptions(props) {
  function renderSortBy() {
    // console.log("-- SortingOptions - render");
    let displayMode = props.dashboardDisplayingMode;

    if (displayMode === 3) {
      return (
        <Fragment>
          <div className="grid_item">
            <div className="sorting_container">
              <div className="sort_by_wrapper">
                <span>Sort by:</span>
              </div>

              <div className="cloud_percentage_wrapper">
                <p
                  className={
                    props.selectedMethod === 1
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortCloudP}
                  onClick={() => props.handleChangeSortingMethod(1)}
                >
                  cloud %
                </p>
              </div>

              <div className="date_wrapper">
                <p
                  className={
                    props.selectedMethod === 2
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortDate}
                  onClick={() => props.handleChangeSortingMethod(2)}
                >
                  date
                </p>
              </div>

              <div className="month_wrapper">
                <p
                  className={
                    props.selectedMethod === 3
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortMonth}
                  onClick={() => props.handleChangeSortingMethod(3)}
                >
                  month
                </p>
              </div>
            </div>
          </div>
        </Fragment>
      );
    }
    //
    else if (displayMode === 2 || displayMode === 1) {
      return (
        <Fragment>
          <div className="grid_item">
            <div className="sorting_container">
              <div className="cloud_percentage_wrapper2">
                <p
                  className={
                    props.selectedMethod === 1
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortCloudP}
                  onClick={() => props.handleChangeSortingMethod(1)}
                >
                  cloud %
                </p>
              </div>

              <div className="date_wrapper">
                <p
                  className={
                    props.selectedMethod === 2
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortDate}
                  onClick={() => props.handleChangeSortingMethod(2)}
                >
                  date
                </p>
              </div>

              <div className="month_wrapper">
                <p
                  className={
                    props.selectedMethod === 3
                      ? "hoverable_menu_option dashboard_menu_selected"
                      : "hoverable_menu_option"
                  }
                  // onClick={props.handleSortMonth}
                  onClick={() => props.handleChangeSortingMethod(3)}
                >
                  month
                </p>
              </div>
            </div>
          </div>
        </Fragment>
      );
    }
  }

  return <Fragment>{renderSortBy()}</Fragment>;
});

//

export default SortingOptions;
