import "./css/intro.css";
import { Fragment, useEffect, useState, useRef } from "react";
// Loading the background image
import bgdImg from "../assets/background_imgs/1.png";

function Intro(props) {
  // VARIABLES ==============================================================================
  // ========================================================================================
  const [firstYearPossible, setFirstYearPossible] = useState(1756);
  const [lastYearPossible, setLastYearPossible] = useState(2018);

  // White <div> that will cover the entire screen
  //  so we can fade out to the next screen.
  const whiteCover = useRef(null);

  // Text input (year)
  // -----------------------------------------------
  const [textInput, _setTextInput] = useState("");
  const textInputRef = useRef(textInput);
  const setTextInput = (data) => {
    textInputRef.current = data;
    _setTextInput(data);
  };

  // isValidInput === ture -> we have a number on the input that is possibly
  //  in the range from the years limit.
  const [isValidInput, _setIsValidInput] = useState(true);
  const isValidInputRef = useRef(isValidInput);
  const setIsValidInput = (data) => {
    isValidInputRef.current = data;
    _setIsValidInput(data);
  };
  // -----------------------------------------------

  // Text References
  const introContainer = useRef(null);
  const introQuestion = useRef(null);
  const introQuestionSpanContainer = useRef(null);
  const interrogationMark = useRef(null);
  const instructionMessage = useRef(null);
  const introContainerTextOnly = useRef(null);

  // Text Animation Stuff (Transition)
  // Everytime we press a key which is not a number, animationTriggeredID
  //  will increase by 1. We do this because we are using asyncronous (setTimeout)
  //  functions to perform the text animation from Instruction to InitialQuestion.
  // So we'll use the animationTriggeredID to check whether there's another call
  //  to perform the same animation soon, so we don't execute it twice.
  var animationTriggeredID = 0;

  // Background Image animation stuff
  const backgroundSvgRef = useRef(null);
  const svgImg = useRef(null);
  var mouseX = 0; // This will be updated everytime the mouse moves over the SVG element.
  var mouseY = 0; // This will be updated everytime the mouse moves over the SVG element.
  var frameId; // This will be used to break the animation loop when the component is killed.

  // By now we are hard coding these values, but it would be better to find out live what are
  //  the real dimensions of the image to be displayed.
  const [bgdImgDimensions, _setBgdImgDimensions] = useState({
    width: 1500,
    height: 1125,
  });
  const bgdImgDimensionsRef = useRef(bgdImgDimensions);
  const setBgdImgDimensions = (data) => {
    bgdImgDimensionsRef.current = data;
    _setBgdImgDimensions(data);
  };

  const browserSupportFeaturesRef = useRef(false);

  // METHODS ================================================================================
  // ========================================================================================
  useEffect(() => {
    // Just to remove the React warnings.
    setFirstYearPossible(1756);
    setLastYearPossible(2018);

    // Adding the mousemove event to the entire window when the component is created.
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleWindowResize);
    window.addEventListener("keydown", handleKeyDown);

    // SVG - Scale the SVG and its elements according to the window size.
    scaleSVG();

    // Scale the Intro Question <div> according to the window size.
    scaleIntroDiv();

    // Scale text according to the window size.
    scaleIntroQuestion();

    // Activate Animation
    requestAnimationFrame(animate);

    // Executed when the component is destroyed.
    return () => {
      // Removing the mousemove event.
      window.removeEventListener("mousemove", handleMouseMove);
      // Removing the resize event.
      window.removeEventListener("resize", handleWindowResize);
      // Removing the keydown event.
      window.removeEventListener("keydown", handleKeyDown);

      // Stop animatin
      cancelAnimationFrame(frameId);
    };
  }, []);

  // Since we access this variable in an event that was created when the component was first
  //  created, we need to use useRef so we can access the last updated value.
  useEffect(() => {
    browserSupportFeaturesRef.current = props.browserSupportFeatures;
  }, [props.browserSupportFeatures]);

  // // When the background image was loaded. Let's
  // //  save the dimensions of the photo.
  // function onBgdImgLoad(event) {
  //   console.log("Image loaded. Dimentions:");
  //   console.log(event);
  //   console.log(this);
  //   setBgdImgDimensions({
  //     width: event.target.offsetWidth,
  //     height: event.target.offsetHeight,
  //   });
  // }

  // Infinite Animation Loop - This is where the background image
  //  and text shadow animation happens.
  function animate(time) {
    if (svgImg.current) {
      // frameId is a global variable in this component.
      // It will be used to stop the animation once the component is destroyed.
      frameId = requestAnimationFrame(animate);

      // Finding how much image out of the window we have in the x Direction.
      let imageOutHorizontally = Math.abs(
        svgImg.current.getBBox().width - window.innerWidth
      );
      let imageOutVertically = Math.abs(
        svgImg.current.getBBox().height - window.innerHeight
      );

      // Getting the mouseX position in % relating to the window dimensions.
      // -1 = left   0 = middle   1 = right border.
      let pX_ = (mouseX / window.innerWidth) * 2 - 1;
      let pY_ = (mouseY / window.innerHeight) * 2 - 1;

      // Keep pX_ and pY_ between -1 and +1
      // Sometimes resizing the window might result in values <-1 or > 1
      pX_ = pX_ > 1 ? 1 : pX_ < -1 ? -1 : pX_;
      pY_ = pY_ > 1 ? 1 : pY_ < -1 ? -1 : pY_;

      // Moving the image according to the mouse movement:
      // ----------------------------------------------------------------------------------------------
      // smoothFactor = 1 -> the image will move directly to the final destination.
      // smoothFactor = 0.01 -> the image will move very slowly towards the final destination.
      const smoothFactor = 0.1;

      // X
      // The final X position the image should be.
      const finalPosX =
        -Math.abs(svgImg.current.getBBox().width - window.innerWidth) / 2 + // centralizing
        pX_ * (imageOutHorizontally / 2); // moving image a bit to left or right according to mouseX

      // Get current X Img Position inside the SVG
      // let currentImgPosX = parseFloat(svgImg.current.style["x"]);
      let currentImgPosX = parseFloat(svgImg.current["x"].baseVal.value);
      if (!currentImgPosX) {
        currentImgPosX = 0;
      }
      // Moving the image by fractions of the distance
      // svgImg.current.style["x"] =
      //   String(currentImgPosX - (currentImgPosX - finalPosX) * smoothFactor) +
      //   "px";
      svgImg.current.setAttribute(
        "x",
        (currentImgPosX - (currentImgPosX - finalPosX) * smoothFactor).toFixed(
          2
        )
      );

      // Y
      // The final Y position the image should be.
      const finalPosY =
        -Math.abs(svgImg.current.getBBox().height - window.innerHeight) / 2 + // centralizing
        pY_ * (imageOutVertically / 2); // moving image a bit to left or right according to mouseX

      // Get current Y Img Position inside the SVG
      // let currentImgPosY = parseFloat(svgImg.current.style["y"]);
      let currentImgPosY = parseFloat(svgImg.current["y"].baseVal.value);
      if (!currentImgPosY) {
        currentImgPosY = 0;
      }
      // Moving the image by fractions of the distance
      // svgImg.current.style["y"] =
      //   String(currentImgPosY - (currentImgPosY - finalPosY) * smoothFactor) +
      //   "px";
      svgImg.current.setAttribute(
        "y",
        (currentImgPosY - (currentImgPosY - finalPosY) * smoothFactor).toFixed(
          2
        )
      );
      // ----------------------------------------------------------------------------------------------

      // Changing the shadow of the intro text
      if (introQuestionSpanContainer && introQuestionSpanContainer.current) {
        // pX_ -> Goes from -1 (border left of the window) to +1 (right border of the window)

        let minShadow = 5;
        let additionalShadow = 4;

        // introQuestion.current.style.textShadow = "-10px 10px rgb(0, 0, 0, 0.25)";
        introQuestionSpanContainer.current.style.textShadow =
          minShadow +
          ((pX_ + 1) / 2) * additionalShadow +
          "px " +
          (minShadow + ((pY_ + 1) / 2) * additionalShadow) +
          "px rgb(0, 0, 0, 0.25)";
      }
    }
  }

  function scaleSVG() {
    // The SVG will be slightly larger than the whole screen
    //  so we can make the image effect on the background.
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    if (windowWidth > 1.3 * windowHeight) {
      // The larger is the SVG width (1.2 * windowWidth) the more
      //  the user will be able to move the image horizontally.
      // svgImg.current.style["width"] = 1.2 * windowWidth + "px";
      // svgImg.current.style["height"] = "auto";
      // WIDTH
      svgImg.current.setAttribute("width", 1.2 * windowWidth + "px");
      // HEIGHT
      svgImg.current.setAttribute(
        "height",
        1.2 *
          windowWidth *
          (bgdImgDimensionsRef.current.height /
            bgdImgDimensionsRef.current.width) +
          "px"
      );
    }
    //
    else {
      // The higher is the SVG height (1.3 * windowHeight) the more
      //  the user will be able to move the image vertically.
      // svgImg.current.style["height"] = 1.3 * windowHeight + "px";
      // svgImg.current.style["width"] = "auto";
      // HEIGHT
      svgImg.current.setAttribute("height", 1.3 * windowHeight + "px");
      // WIDTH
      svgImg.current.setAttribute(
        "width",
        1.3 *
          windowHeight *
          (bgdImgDimensionsRef.current.width /
            bgdImgDimensionsRef.current.height) +
          "px"
      );
    }

    // centralizing the image
    // svgImg.current.style["x"] =
    //   -Math.abs(svgImg.current.getBBox().width - windowWidth) / 2;

    // svgImg.current.style["y"] =
    //   -Math.abs(svgImg.current.getBBox().height - windowHeight) / 2;
    // X
    svgImg.current.setAttribute(
      "x",
      -Math.abs(svgImg.current.getBBox().width - windowWidth) / 2
    );
    // Y
    svgImg.current.setAttribute(
      "y",
      -Math.abs(svgImg.current.getBBox().height - windowHeight) / 2
    );
  }

  function scaleIntroDiv() {
    // Logic:
    // If window width <= 560px  -> introDiv width = 90%
    // If window width >= 1670px -> introDiv width = 45%

    // If the window is too small, let's make the div occupy most of it
    if (window.innerWidth <= 560) {
      introContainer.current.style["width"] = 90 + "%";
    }
    // If the window is too large, let's make the div occupy kinda half
    else if (window.innerWidth >= 1670) {
      introContainer.current.style["width"] = 45 + "%";
    }
    // If the window is between, let's interpolate between 90 and 45 %
    else {
      introContainer.current.style["width"] =
        -0.04054 * window.innerWidth + 112.7024 + "%";
    }
  }

  function scaleIntroQuestion() {
    let containerWidth = introContainer.current.getBoundingClientRect().width;

    introQuestionSpanContainer.current.style["fontSize"] =
      0.15 * containerWidth + "px";
    instructionMessage.current.style["fontSize"] =
      0.85 * 0.15 * containerWidth + "px";

    // This function shrinks the text little by little until it fits its container.
    function shrinkText() {
      let textSize = parseFloat(
        introQuestionSpanContainer.current.style["fontSize"].split("px")[0]
      );

      // Shrinking factor
      textSize *= 0.97;

      introQuestionSpanContainer.current.style["fontSize"] = textSize + "px";
      instructionMessage.current.style["fontSize"] = 0.9 * textSize + "px";

      if (
        introContainerTextOnly.current.getBoundingClientRect().width >
          introContainer.current.getBoundingClientRect().width ||
        introContainerTextOnly.current.getBoundingClientRect().height >
          introContainer.current.getBoundingClientRect().height
      ) {
        shrinkText();
      }
    }

    if (
      introContainerTextOnly.current.getBoundingClientRect().width >
        introContainer.current.getBoundingClientRect().width ||
      introContainerTextOnly.current.getBoundingClientRect().height >
        introContainer.current.getBoundingClientRect().height
    ) {
      shrinkText();
    }
  }

  function handleWindowResize() {
    // Scale the <svg> element
    scaleSVG();

    // Scale the Intro Question <div>
    scaleIntroDiv();

    // Scale the Intro Question <p>
    scaleIntroQuestion();
  }

  function handleMouseMove(e) {
    // Saving the mouseX and mouseY when hovering over the SVG.
    if (backgroundSvgRef && backgroundSvgRef.current) {
      // Getting the mouse position
      const windowMouseX = e.pageX;
      const windowMouseY = e.pageY;

      // Checking if the mouse is over the SVG
      const divX = backgroundSvgRef.current.getBoundingClientRect().x;
      const divY = backgroundSvgRef.current.getBoundingClientRect().y;
      const divWidth = backgroundSvgRef.current.getBoundingClientRect().width;
      const divHeight = backgroundSvgRef.current.getBoundingClientRect().height;

      if (windowMouseX >= divX && windowMouseX <= divX + divWidth) {
        if (windowMouseY >= divY && windowMouseY <= divY + divHeight) {
          // The mouse is over the SVG/ref
          mouseX = windowMouseX - divX;
          mouseY = windowMouseY - divY;
        }
      }
    }
  }

  // INSTRUCTION MESSAGE -> INTRO QUESTION
  // Setting the CSS Transition time values to animate from Instruction messasge -> intro question.
  function setFadeOutTimeValuesBackwards() {
    let fadeOutTime = 0.45;
    let fadeInTime = 2.3;

    if (
      instructionMessage.current &&
      introQuestion.current &&
      interrogationMark.current
    ) {
      // Adjusting animation time for:
      // Instruction message.
      instructionMessage.current.style["transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      instructionMessage.current.style["-webkit-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      instructionMessage.current.style["-moz-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      instructionMessage.current.style["-ms-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      instructionMessage.current.style["-o-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";

      // Intro question
      introQuestion.current.style["transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      introQuestion.current.style["-webkit-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      introQuestion.current.style["-moz-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      introQuestion.current.style["-ms-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      introQuestion.current.style["-o-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";

      // Question mark
      interrogationMark.current.style["transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      interrogationMark.current.style["-webkit-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      interrogationMark.current.style["-moz-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      interrogationMark.current.style["-ms-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      interrogationMark.current.style["-o-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
    }
  }

  // INTRO QUESTION -> INSTRUCTION MESSAGE
  // Setting the CSS Transition time values to animate from Intro question -> Instruction messasge.
  function setFadeOutTimeValuesForward() {
    let fadeOutTime = 0.45;
    let fadeInTime = 2.3;

    if (
      instructionMessage.current &&
      introQuestion.current &&
      interrogationMark.current
    ) {
      // Reseting animation time for:
      // Instruction message
      instructionMessage.current.style["transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      instructionMessage.current.style["-webkit-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      instructionMessage.current.style["-moz-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      instructionMessage.current.style["-ms-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";
      instructionMessage.current.style["-o-transition"] =
        "opacity " + fadeInTime + "s ease-in-out";

      // Intro question
      introQuestion.current.style["transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      introQuestion.current.style["-webkit-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      introQuestion.current.style["-moz-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      introQuestion.current.style["-ms-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      introQuestion.current.style["-o-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";

      // Question mark
      interrogationMark.current.style["transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      interrogationMark.current.style["-webkit-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      interrogationMark.current.style["-moz-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      interrogationMark.current.style["-ms-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
      interrogationMark.current.style["-o-transition"] =
        "opacity " + fadeOutTime + "s ease-in-out";
    }
  }

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

  function getClosestValidInput(input) {
    // If input = '17a6', this function returns '17'.

    // Let's remove the last character until the input is valid.
    while (
      !isPossiblyAValidYear(input, firstYearPossible, lastYearPossible) &&
      input.length > 0 // we should stop when we removed all chars from textInput
    ) {
      // Remove the last char of the textInput.current.

      input = input.slice(0, -1);
    }

    return input;
  }

  // Animate text back and forth:
  //  Intro text -> Intructions
  //  Intructions -> Intro text
  function transitionText() {
    // Everytime we press a key which is not a number, animationTriggeredID
    //  will increase by 1. We do this because we are using asyncronous (setTimeout)
    //  functions to perform the text animation from Instruction to InitialQuestion.
    // So we'll use the animationTriggeredID to check whether there's another call
    //  to perform the same animation soon, so we don't execute it twice.
    animationTriggeredID += 1;

    if (
      introQuestion.current &&
      interrogationMark.current &&
      instructionMessage.current
    ) {
      setFadeOutTimeValuesForward();
      // Hide the intro question
      introQuestion.current.style["opacity"] = 0;
      // Hide the question mark
      interrogationMark.current.style["opacity"] = 0;
      // Show the instruction message
      instructionMessage.current.style["opacity"] = 1;

      function showIntroQuestionAgain() {
        // Save the current animationTriggeredID so we can use it
        //  in the setTimeout function below. If we don't do this we'll get
        //  the current animationTriggeredID (global variable), and not the
        //  id that triggered the function.
        let id_temp = animationTriggeredID;

        // We wait few seconds until we show the Intro question again.
        setTimeout(function () {
          // if id_temp < animationTriggeredID it means that this animation
          //  was already requested to be performed again and therefore we
          //  should not performed it now because it will be run soon.
          //
          // if id_temp === animationTriggeredID it means that there's no animation
          //  comming here soon, so we should perform this now.
          if (id_temp === animationTriggeredID) {
            setFadeOutTimeValuesBackwards();

            if (
              introQuestion.current &&
              interrogationMark.current &&
              instructionMessage.current
            ) {
              // Hide instruction message
              instructionMessage.current.style["opacity"] = 0;
              // Show intro question
              introQuestion.current.style["opacity"] = 1;
              // Show question mark
              interrogationMark.current.style["opacity"] = 1;

              // Clean the textInput
              setTextInput(getClosestValidInput(textInputRef.current));
              // Since it's cleaned, we have now a validInput there.
              setIsValidInput(true);
            }
          }
        }, 3000);
      }
      showIntroQuestionAgain();
    }
  }

  function handleKeyDown(event) {
    // You can use: event.keyCode or event.key

    // Checking whether the key pressed is:
    //  .a letter (a-z): event.keyCode >= 65 && event.keyCode <= 90
    //  .a number (0-9): event.keyCode >= 48 && event.keyCode <= 57
    //  .backspace: event.key === "Backspace"
    if (
      (event.keyCode >= 48 && event.keyCode <= 57) ||
      (event.keyCode >= 65 && event.keyCode <= 90) ||
      event.key === "Backspace"
    ) {
      // If Backspace pressed:
      if (event.key === "Backspace") {
        // Let's remove the last character
        setTextInput(textInputRef.current.slice(0, -1));

        if (
          isPossiblyAValidYear(
            textInputRef.current,
            firstYearPossible,
            lastYearPossible
          )
        ) {
          setIsValidInput(true);
        }
      }
      // A letter or a number.
      else {
        // We don't do anything if textInput already has a length of 4 or bigger.
        if (textInputRef.current.length < 4) {
          // Valid input.
          if (
            isPossiblyAValidYear(
              textInputRef.current + event.key,
              firstYearPossible,
              lastYearPossible
            )
          ) {
            setTextInput(textInputRef.current + event.key);
            setIsValidInput(true);

            // Check if we have a full valid year input.
            // If so, let's fade out the entire component and go
            //  to the next page.
            if (textInputRef.current.length === 4) {
              // If the browser supports all features we need.
              if (browserSupportFeaturesRef.current) {
                whiteCover.current.style["opacity"] = 1;

                // We a bit until we switch components
                setTimeout(function () {
                  // props.setIsInIntro(false);
                  props.setYear(Number(textInputRef.current));
                }, 700);
              }
              // In case the browser doesn't support all features we need.
              else {
                alert(
                  "This application does not function well in your browser. Try opening it on the last version of: Google Chrome, Firefox, or Safari."
                );
              }
            }
          }
          // NOT valid input.
          else {
            setTextInput(textInputRef.current + event.key);
            setIsValidInput(false);
            transitionText(); // this will also get back to the closest valid input.
          }
        }
      }
    }
  }

  function printInputYear() {
    // Returns the HTML to print the textInput.

    // VALID input
    if (isValidInput) {
      // If we have some valid initial (or complete) digits for the years.
      if (textInput.length > 0) {
        return (
          <Fragment>
            <span className="AfadeIn">{textInput}</span>
            <span id="caret">|</span>
          </Fragment>
        );
      }
      // If the input is empty -> Year suggestion
      else {
        return (
          <Fragment>
            <span id="caret">|</span>
            <span className="yearSuggestion">{firstYearPossible}</span>
          </Fragment>
        );
      }
    }
    // INVALID input
    else {
      // If we have an invalid input to display
      if (textInput.length > 0) {
        return (
          <Fragment>
            <span className="yearSuggestion wrong_input">{textInput}</span>
            <span id="caret">|</span>
          </Fragment>
        );
      }
      // If the input is empty -> Year suggestion
      else {
        return (
          <Fragment>
            <span id="caret">|</span>
            <span className="yearSuggestion">{firstYearPossible}</span>
          </Fragment>
        );
      }
    }
  }

  return (
    <Fragment>
      <div id="app_container">
        <div id="white_cover" ref={whiteCover}></div>

        <svg
          id="background_svg"
          ref={backgroundSvgRef}
          width="100%"
          height="100%"
          // viewBox={"0 0 " + window.innerWidth + " " + window.innerHeight}
          // xmlns="http://www.w3.org/2000/svg"
        >
          <image
            id="svgImg"
            href={bgdImg}
            ref={svgImg}
            width="100%"
            height="100%"
            x="0"
            y="0"
            preserveAspectRatio="none" // So we can set larger dimensions than the original image.
          />
        </svg>

        <div id="intro_container" ref={introContainer}>
          <div id="intro_container_text_only" ref={introContainerTextOnly}>
            <span
              id="intro_question_span_container"
              ref={introQuestionSpanContainer}
            >
              <span id="intro_question" ref={introQuestion}>
                How Stockholm's sky looked like in &nbsp;
              </span>
              <span id="instruction_message" ref={instructionMessage}>
                A year between {firstYearPossible} and {lastYearPossible}
              </span>
              <div id="inputDiv">
                <p>{printInputYear()}</p>
              </div>
              &nbsp;
              <span id="interrogation_mark" ref={interrogationMark}>
                ?
              </span>
            </span>
          </div>
        </div>
      </div>
      <footer id="intro">
        <div id="footer_container_1">
          <div id="footer_container_2">
            <p>
              <a href="http://kauamelo.com"> kauã</a> - 2021
            </p>
          </div>
        </div>
      </footer>
    </Fragment>
  );
}

export default Intro;
