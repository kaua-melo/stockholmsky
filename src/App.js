import "./App.css";
import Intro from "./hooks/intro";
import FullBoard from "./hooks/fullBoard";
import { Fragment, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";

function App() {
  // The year the user chose/typed in the intro.
  const [year, setYear] = useState(null);

  const [browserSupportFeatures, setBrowserSupportFeatures] = useState(false);

  useEffect(() => {
    // If the user is in a phone
    if (isMobile) {
      alert(
        "This app doesn't run on mobiles yet :( Check it out on your laptop when you get home."
      );
    }
    // Check if the browser supports the features our app is using.
    else if (typeof window.ResizeObserver != "undefined") {
      setBrowserSupportFeatures(true);
    }
    //
    else {
      setBrowserSupportFeatures(false);

      alert(
        "This application does not function well in your browser. Try opening it on the last version of: Google Chrome, Firefox, or Safari."
      );
    }
  }, []);

  return (
    <Fragment>
      {year && browserSupportFeatures ? (
        <FullBoard year={year} />
      ) : (
        <Intro
          setYear={setYear}
          browserSupportFeatures={browserSupportFeatures}
        />
      )}
    </Fragment>
  );
}

export default App;
