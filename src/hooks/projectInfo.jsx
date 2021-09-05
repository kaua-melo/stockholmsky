import "./css/projectInfo.css";
import { Fragment, useEffect, useRef } from "react";
import closeIconWhite from "../assets/icons/close_sign_white.svg";

function ProjectInfo(props) {
  const projectInfoContainer = useRef(null);
  const closeIconRef = useRef(null);
  const closingButtonBorderRef = useRef(null);

  // 'Constructor'
  useEffect(() => {
    if (projectInfoContainer.current) {
      projectInfoContainer.current.style["opacity"] = 1;
      projectInfoContainer.current.style["visibility"] = "visible";
    }
  }, []);

  function closeProjectInfo() {
    projectInfoContainer.current.style["opacity"] = 0;
    projectInfoContainer.current.style["visibility"] = "hidden";
    // Fading out:
    setTimeout(function () {
      props.setShowProjectInfo(false);
    }, 400);
  }

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
      <div id="projectInfo_container" ref={projectInfoContainer}>
        <div id="container_scroll">
          <div id="info_grid">
            <div id="text_container">
              <h1>Stockholm Sky</h1>
              <p>
                It’s been 4 solid years that I live in Stockholm and the most
                common complain that I hear is “there’s no sun here”.
              </p>
              <img
                src={process.env.PUBLIC_URL + "/projectInfo_cloudday2.jpeg"}
                alt=""
              ></img>
              <div class="photo_legend">
                <span>
                  <i>
                    This is not a black and white picture. Karlbergs Slott,
                    Stockholm - 2021.3.12.
                  </i>
                </span>
              </div>
              <p>
                Quikly, the conversation escalates to an attempt to explain why
                many here are so reserved, melancholic, and find it difficult to
                make friends. It also typically finishes with a comparison with
                an experience the person had abroad, in some warmer country with
                a bluer sky.
              </p>
              <p>
                Between us and the so desired soul-lifting blue sky, the main
                enemy here are the clouds. Typically, regardless whether it's
                summer or winter, the more clouds the less blue, and
                consequently the grayer and darker is the day.
                <i> Stockholm Sky </i> is a visualization of the amount of
                clouds over more than 250 years, with the aim of showing how
                much 'blue' and 'gray' we trully have each year.
              </p>
              <h2> How ?</h2>
              <p>
                Each little rectangle represents the percentage of cloud of one
                day at midday (12:00 PM). While 100% cloud means that the sky
                was completly covered by clouds (therefore gray and probably
                dark), 0% cloud means that the sky had no cloud and therefore
                was completely blue:
              </p>
              <img src={process.env.PUBLIC_URL + "/blue_sky.jpg"} alt=""></img>
              {/* <img
                src={
                  process.env.PUBLIC_URL + "/photo5874973442669918324_copy.jpg"
                }
                alt=""
              ></img> */}
              <p>
                In total, we have 365 rectangles representing how the year
                looked like at midday. You can sort them by: cloud %, date, and
                month, and you can also see how many and when we had super blue
                (or super gray) days by using the filtering tool. For example,
                by showing only days with % of cloud between 0 and 30%, we can
                see that the month of May in 2018 was a really blueish month:
              </p>
              <img
                id="case1"
                src={process.env.PUBLIC_URL + "/case1.png"}
                alt=""
              ></img>
              <p>
                While the months of November, December, January, and February
                had several very gray days in a row (% of cloud between 70 and
                100%):
              </p>
              <img
                id="case2"
                src={process.env.PUBLIC_URL + "/case2.png"}
                alt=""
              ></img>
              <p>
                In fact, we can see that in the year of 2018, only the months of
                May, Jun, and July had few gray days. You might think that it's
                kind of expected since the summer is around those months and the
                winter typically happens from ~November to ~February, but that's
                not necessarily true. Do the same filtering in the year of 2001
                and you'll see that it was a fairly distributed year when it
                comes to how much blue and gray it had.
              </p>
              <h2> Data</h2>
              <p>
                Cloud observations have been done in Stockholm since 1756 from
                the&nbsp;
                <a
                  href="https://www.google.com/maps/search/59.3417N,+18.0549E?sa=X&ved=2ahUKEwip1_aio-XyAhX9SvEDHa6qDNgQ8gF6BAgCEAE"
                  target="_blank"
                >
                  Stockholm Old Astronomical Observatory
                </a>
                . Handwritten observations journals from the Royal Swedish
                Academy of Sciences and observations by&nbsp;
                <a href="https://www.smhi.se/" target="_blank">
                  SMHI
                </a>
                &nbsp;were interpreted and digitalized by SMHI and&nbsp;
                <a
                  href="https://www.su.se/profiles/amobe-1.184463"
                  target="_blank"
                >
                  Anders Moberg
                </a>
                , who finally produced the&nbsp;
                <a
                  href="https://bolin.su.se/data/stockholm-historical-cloud-amount"
                  target="_blank"
                >
                  "Stockholm Historical Weather Observations — Sub-daily cloud
                  amount since 1756"
                </a>
                &nbsp; used here.
              </p>
              <div id="pehrs_diary_div">
                <img
                  id="pehrs_diary"
                  src={process.env.PUBLIC_URL + "/pehrs_diary_resized.png"}
                  alt=""
                ></img>
                <div class="photo_legend">
                  <span>
                    <i>
                      Weather observation diary of the astronomer Pehr Wilhelm
                      Wargentin, January 1756 .
                    </i>
                  </span>
                </div>
              </div>

              <p>
                The sky photos used were taken in Stockholm, on a Google Pixel
                4a 5G, everyday, between 12:00 and 12:30PM, around this
                area&nbsp;
                <a
                  href="https://www.google.com/maps/place/59%C2%B020'35.8%22N+18%C2%B001'35.7%22E/@59.3432687,18.0260218,116m/data=!3m2!1e3!4b1!4m14!1m7!3m6!1s0x0:0x0!2zNTnCsDIwJzMwLjEiTiAxOMKwMDMnMTcuNiJF!3b1!8m2!3d59.3417!4d18.0549!3m5!1s0x0:0x0!7e2!8m2!3d59.3432681!4d18.0265687"
                  target="_blank"
                >
                  59°20'35.8"N 18°01'35.7"E
                </a>
                . They were sorted by their amount of cloud. The photos can be
                found&nbsp;
                <a
                  href="https://www.instagram.com/stockholm.sky/"
                  target="_blank"
                >
                  here
                </a>
                .
              </p>
              <h2> Tech</h2>
              <p>
                The website was built in React and the visualizations done with
                D3.js.
              </p>
              <p>
                In order to calculate the percentage of cloud on each image, a
                set of colors that was judged to represent a clear sky was
                handpicked from the photos. The photos were then divided in a
                grid and the Euclidian distance calculated between the average
                color of each cell and the set of colors that represent a clear
                sky. If the distance to any handpicked color was smaller than
                10%, we assume that the cell contains mostly sky. If the
                distance to all handpicked colors were greater than 10%, the
                cell contains mostly clouds. The code was implemented using
                openFrameworks:
              </p>
              <img
                src={process.env.PUBLIC_URL + "/skyPhotoAnalysis.gif"}
                alt=""
              ></img>
              <h2> Disclaimer</h2>
              <p>
                The scales used to measure the amount of clouds changed over the
                years as follows:
              </p>
              <ul>
                <li>1756-01-01 to 1784-06-01 -> Scale: 1 to 3.</li>
                <li>1784-06-02 to 1815-12-31 -> Scale:1 to 6.</li>
                <li>1816-01-01 to 1841-06-30 -> Scale: 1 to 4.</li>
                <li>1841-07-01 to 1858-12-31 -> Scale: 1 to 6.</li>
                <li>1859-01-01 to 1872-12-31 -> Scale: 0 to 4.</li>
                <li>1873-01-01 to 1960-12-31 -> Scale: 0 to 10.</li>
                <li>1961-01-01 to 2012-12-31 -> Scale: 0 to 8.</li>
                <li>2013-01-01 to 2018-12-31 -> Scale: 0 to 100.</li>
              </ul>

              <p>
                Even though all scales were normalized to a 0-100 scale,
                comparisons of amount of cloud over the centuries are not
                encouraged due to the different types of measurements during the
                years and due to the subjectivity of different observers'
                interpretations of the sky. More info on this can be found
                on&nbsp;
                <a
                  href="https://scholar.google.se/citations?view_op=view_citation&hl=en&user=nXUPda4AAAAJ&cstart=20&pagesize=80&sortby=pubdate&citation_for_view=nXUPda4AAAAJ:blknAaTinKkC"
                  target="_blank"
                >
                  "Were Southern Swedish summer temperatures before 1860 as warm
                  as measured?"
                </a>
                . The dataset is though quite good to see cloud amount changes
                within each year, from day-to-day.
              </p>

              <p>
                Some measurements were missing or had a value out of the scale.
                These values were manually set to the average between the day
                before and after:
              </p>

              <ul>
                <li>1793-07-28. Set to 3.5.</li>
                <li>1798-11-19. Set to 2.5.</li>
                <li>1800-04-02. Set to 6.</li>
                <li>1808-03-03. Set to 3.5.</li>
                <li>1815-11-15. Set to 6.</li>
                <li>1829-06-25. Set to 2.</li>
                <li>1829-09-27. Set to 2.</li>
                <li>1830-06-25. Set to 3.</li>
                <li>1831-02-23. Set to 3.</li>
                <li>1831-07-15. Set to 1.</li>
                <li>1832-11-28. Set to 2.5.</li>
                <li>1834-11-24. Set to 2.5.</li>
                <li>1836-06-26. Set to 3.</li>
                <li>1836-07-20. Set to 3.</li>
                <li>1837-10-09. Set to 4.</li>
                <li>1839-05-13. Set to 2.5.</li>
                <li>1839-05-24. Set to 2.5.</li>
                <li>1840-10-07. Set to 2.5.</li>
                <li>1859-01-17. Set to 3.5.</li>
                <li>1861-11-03. Set to 3.</li>
                <li>1865-09-22. Set to 0.</li>
                <li>1866-08-28. Set to 1.5.</li>
                <li>1873-08-28. Set to 7.5.</li>
                <li>1978-11-17. Set to 7.5.</li>
                <li>1981-03-16. Set to 3.5.</li>
                <li>2013-01-16. Set to 100.</li>
                <li>2013-05-06. Set to 6.</li>
                <li>2013-05-16. Set to 57.</li>
                <li>2013-06-11. Set to 82.</li>
                <li>2014-02-06. Set to 100.</li>
                <li>2014-02-16. Set to 100.</li>
                <li>2014-11-26. Set to 100.</li>
                <li>2015-11-06. Set to 100.</li>
              </ul>
              <p id="projectInfo_footer">
                <a href="https://kauamelo.com/" target="_blank">
                  Kauã
                </a>
                &nbsp;- 2021
              </p>
            </div>

            <div
              id="close_info_container"
              onMouseEnter={mouseEnterClosingButton}
              onMouseLeave={mouseLeaveClosingButton}
            >
              <div
                id="close_info_border"
                onClick={closeProjectInfo}
                ref={closingButtonBorderRef}
              >
                <img src={closeIconWhite} alt="x" ref={closeIconRef}></img>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default ProjectInfo;
