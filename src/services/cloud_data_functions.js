import { cloud_data } from "./cloud_1756_2018.js";

// Returns the data for the specific year.
export function getYear(year) {
  return cloud_data.find((y) => y.year === year);
}

export function getAllYearsAndAverage() {
  let yearAndAverage = cloud_data.map((y) => {
    return { year: y.year, avg: y.avg };
  });

  // yearAndAverage will look like this:
  //   {year: 1756, avg: 54}
  //   {year: 1757, avg: 53}
  //   {year: 1758, avg: 53}
  //   ...

  return yearAndAverage;
}
