import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import './Dashboard.css';
import { getMarkets } from './PredictItApi';
import { getSubsetOfMarkets, Markets, MarketsAndOutcomes, RealTimePriceChart } from './RealTimePriceChart';

interface ChartConfig { // ChartConfig should not be confused with ChartOptions. ChartConfig is more like "config related to embedding this chart in the dashboard", perhaps it should be renamed/moved/changed
  noAutoChart?: true; // iff true, this chart won't automatically be added to the list of automatic charts
  marketsAndOutcomes: MarketsAndOutcomes;
}

export const Dashboard: React.SFC<{}> = (props) => {
  const historySeconds: number = (() => {
    const raw = queryString.parse((props as any).location.search).historySeconds;
    const raw2 = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
    return isNaN(raw2) ? 72 : raw2;
  })();

  const isColorBlindMode: boolean = (() => {
    const raw = queryString.parse((props as any).location.search).colorBlindMode;
    return typeof raw === 'string' && raw.length > 0;
  })();

  const [isChatHidden, setIsChatHidden] = useState(false); // TODO url query param for config fields and also a config UI
  const [markets, setMarkets] = useState(undefined as undefined | Markets);
  const [marketsForOneChartByChartName, setMarketsForOneChartByChartName] = useState({} as { [chartName: string]: Markets });
  const [autoChartNames, setAutoChartNames] = useState([] as string[]);

  useEffect(() => {
    const ms = getMarkets();
    setMarkets(ms);

    const marketsAndOutcomesForAllCharts: { [chartName: string]: ChartConfig } = {
      "2020winner": {
        noAutoChart: true,
        marketsAndOutcomes: {
          2721: { // Which-party-will-win-the-2020-US-presidential-election
            outcomeIds: {
              4390: true, // Dems
              4389: true, // Reps
            },
          },
          3698: { // Who will win the 2020 U.S. presidential election?
            outcomeIds: {
              7940: true, // Biden
              7943: true, // Trump
            },
          },
          4036: {}, // Will a woman be elected U.S. vice president in 2020?
          5961: {}, // Will the 2020 TX Democratic primary winner win the presidency?
          5960: {}, // Will the 2020 SC Democratic primary winner win the presidency?
          5963: {}, // Will the 2020 MA Democratic primary winner win the presidency?
        },
      },
      "electoralMargin": {
        marketsAndOutcomes: {
          6653: { // Electoral College margin of victory?
            outcomeIds: {
              22326: true, // Dems by 100 - 149
              22346: true, // Dems by 150 - 209
              22348: true, // Dems by 210 - 279
              22317: true, // GOP by 30 - 59
              22319: true, // GOP by 60 - 99
              22325: true, // GOP by 100 - 149
              // Lower priority:
              22318: true, // Dems by 60 - 99
              22324: true, // Dems by 280+
              // TODO right now we have a hard maximum of 8 outcomes due to that's all the colors in the color wheel
              // 22316: true, // GOP by 10 - 29
              // 22345: true, // GOP by 150 - 209
            },
          },
        },
      },
      "popularVoteMargin": {
        marketsAndOutcomes: {
          6663: { // Popular Vote margin of victory?
            outcomeIds: {
              22403: true, // Dems by 7.5% - 9%
              22399: true, // Dems by 10.5%+
              22405: true, // Dems by 9% -10.5%
              22401: true, // Dems by 6 % - 7.5 %
              22393: true, // Dems by 4.5% - 6%
              22398: true, // Dems by 3% - 4.5%
              22397: true, // Dems by 1.5 % - 3 %
              22396: true, // Dems by 1.5%-
            },
          },
        },
      },
      // "FL": {
      //   marketsAndOutcomes: {
      //     5544: {}, // Which party will win FL in 2020?
      //   },
      // },
      "MI": {
        marketsAndOutcomes: {
          5545: {}, // Which party will win MI in 2020?
        },
      },
      "PA": {
        marketsAndOutcomes: {
          5543: {}, // Which party will win PA in 2020?
        },
      },
      // "MN": {
      //   marketsAndOutcomes: {
      //     5597: {}, // Which party will win MN in 2020?
      //   },
      // },
      // "TX": {
      //   marketsAndOutcomes: {
      //     5798: {}, // Which party will win TX in 2020?
      //   },
      // },
      "WI": {
        marketsAndOutcomes: {
          5542: {}, // Which party will win WI in 2020?
        },
      },
      "AZ": {
        marketsAndOutcomes: {
          5596: {}, // Which party will win AZ in 2020?
        },
      },
      "NC": {
        marketsAndOutcomes: {
          5599: {}, // Which party will win NC in 2020?
        },
      },
      "GA": {
        marketsAndOutcomes: {
          5604: {}, // Which party will win GA in 2020?
        },
      },
      // "OH": {
      //   marketsAndOutcomes: {
      //     5600: {}, // Which party will win OH in 2020?
      //   },
      // },
      "NV": {
        marketsAndOutcomes: {
          5601: {}, // Which party will win NV in 2020?
        },
      },
      // "NH": {
      //   marketsAndOutcomes: {
      //     5598: {}, // Which party will win NH in 2020?
      //   },
      // },
      // "IA": {
      //   marketsAndOutcomes: {
      //     5603: {}, // Which party will win IA in 2020?
      //   },
      // },
      // "NM": {
      //   marketsAndOutcomes: {
      //     6573: {}, // Which party will win NM in 2020?
      //   },
      // },
      // "NE-02": {
      //   marketsAndOutcomes: {
      //     6608: {}, // Which party will win NE-02?
      //   },
      // },
      // "ME-02": {
      //   marketsAndOutcomes: {
      //     6190: {}, // Which party will win ME-02?
      //   },
      // },
      "balanceOfPower": {
        marketsAndOutcomes: {
          4353: {}, // What-will-be-the-balance-of-power-in-Congress-after-the-2020-election
        },
      },
      "controlHouse": {
        marketsAndOutcomes: {
          4365: {}, // Which party controls House after 2020 election
        },
      },
      "controlSenate": {
        marketsAndOutcomes: {
          4366: {}, // Which party controls Senate after 2020 election
        },
      },
      "netChangeSenate": {
        marketsAndOutcomes: {
          6670: { // What-will-be-the-net-change-in-Senate-seats-by-party
            outcomeIds: {
              22467: true, // Dems +4
              22468: true, // Dems +5
              22463: true, // Dems +7
              22466: true, // Dems +3
              22471: true, // Dems +6
              22460: true, // Dems +2
              22461: true, // Dems +1
              22465: true, // Gop +4
            },
          },
        },
      },
      "changeHouse": {
        marketsAndOutcomes: {
          6669: { // How-many-House-seats-will-Democrats-win-in-the-2020-election
            outcomeIds: {
              22459: true, // 246 or more
              22454: true, // 242
              22452: true, // 238
              22455: true, // 234
              22449: true, // 209 or fewer
              22450: true, // 218
              22457: true, // 210
            },
          },
        },
      },
      "FLmargin": {
        marketsAndOutcomes: {
          6927: { // What-will-be-the-margin-in-the-presidential-election-in-Florida
            outcomeIds: {
              23919: true, // R by 1%
              23918: true, // R by under 1%
              23926: true, // R by 3-4%
              23925: true, // D by 6%
              23922: true, // R by 6%
              23923: true, // D by under 1%
              23931: true, // D by 5%
              23930: true, // R by 5%
            },
          },
        },
      },
      // "OHmargin": {
      //   marketsAndOutcomes: {
      //     6915: { // What-will-be-the-margin-in-the-presidential-election-in-Ohio
      //       outcomeIds: {
      //         23828: true, // R 3.5%+
      //         23832: true, // D 3.5%+
      //         23830: true, // D 0.5%
      //         23824: true, // R 0.5%
      //         23826: true, // D 1.5%
      //         23836: true, // D 2.5%
      //       },
      //     },
      //   },
      // },
      "smallestMargin": {
        marketsAndOutcomes: {
          6687: { // Which-state-will-be-won-by-the-smallest-margin-in-the-presidential-election
            outcomeIds: {
              22566: true, // OH
              22563: true, // FL
              22570: true, // GA
              22572: true, // PA
              22565: true, // NC
              22564: true, // WI
              22569: true, // CO
              22574: true // ME
            },
          },
        },
      },
      "tippingPoint": {
        marketsAndOutcomes: {
          6664: { // What-will-be-the-'tipping-point'-jurisdiction-in-2020
            outcomeIds: {
              22415: true, // PA
              22406: true, // FL
              22410: true, // AZ
              22411: true, // MI
              22407: true, // WI
              22408: true, // NC
              22412: true, // NB
              22409: true, // OH
            },
          },
        },
      },
      "howManyVotes": {
        marketsAndOutcomes: {
          6882: { // How-many-votes-in-the-2020-US-presidential-election
            outcomeIds: {
              23641: true, // 160M+
              23640: true, // 157M-
              23639: true, // 154
              23635: true, // 151
              23631: true, // 148
              23636: true, // 145
              23632: true, // 142
              23634: true, // 139
            },
          },
        },
      },
      "demsWinAll": {
        marketsAndOutcomes: {
          6770: {}, // Will-Democrats-win-the-White-House,-Senate-and-House-in-2020
        },
      },
      "whenElectionCalled": {
        marketsAndOutcomes: {
          6871: { // When-will-the-presidential-election-outcome-be-called
            outcomeIds: {
              23558: true, // Nov 4
              23557: true, // Nov 3
              23615: true, // after Dec 14
              23559: true, // Nov 5
              23560: true, // Nov 6-7
              23614: true, // Dec 1-14
              23561: true, // Nov 8-9
              23612: true, // Nov 17-23
            },
          },
        },
      },
      // "trumpWinsPopularVote": {
      //   marketsAndOutcomes: {
      //     5554: {}, // Will-Donald-Trump-win-the-popular-vote-in-2020
      //   },
      // },
      "popularVoteWinnerAlsoWinsElectoralCollege": {
        marketsAndOutcomes: {
          6642: {}, // Will-the-winner-of-the-popular-vote-also-win-the-Electoral-College
        },
      },
      // "trumpLoseAny2016StateHeWon": {
      //   marketsAndOutcomes: {
      //     6727: {}, // Will-Donald-Trump-lose-any-state-he-won-in-2016
      //   },
      // },
      "trumpWinAny2016StateHeLost": {
        marketsAndOutcomes: {
          6724: {}, // Will-Donald-Trump-win-any-state-he-lost-in-2016
        },
      },
      // "trumpWinningDayAfterElection": {
      //   marketsAndOutcomes: {
      //     6920: {}, // Will-Donald-Trump-be-winning-at-6-am-(ET)-the-day-after-the-election
      //   },
      // },
      "trumpCompleteFirstTerm": {
        marketsAndOutcomes: {
          5158: {}, // Will-Donald-Trump-complete-his-first-term
        },
      },
      // "CO": {
      //   marketsAndOutcomes: {
      //     5605: {}, // Which party will win CO in 2020?
      //   },
      // },
      // "VA": {
      //   marketsAndOutcomes: {
      //     5602: {}, // Which party will win VA in 2020?
      //   },
      // },
      // "AK": {
      //   marketsAndOutcomes: {
      //     6591: {}, // Which party will win AK in 2020?
      //   },
      // },
      // "OR": {
      //   marketsAndOutcomes: {
      //     6582: {}, // Which party will win OR in 2020?
      //   },
      // },
      // "ME": {
      //   marketsAndOutcomes: {
      //     6571: {}, // Which party will win ME in 2020?
      //   },
      // },
      // "MO": {
      //   marketsAndOutcomes: {
      //     6581: {}, // Which party will win MO in 2020?
      //   },
      // },
    };

    const wipAutoChartNames: string[] = [];
    const wipMarketsForOneChartByChartName: { [chartName: string]: Markets } = {};

    for (const chartName of Object.keys(marketsAndOutcomesForAllCharts)) {
      const chartConfig = marketsAndOutcomesForAllCharts[chartName];
      if (chartConfig.noAutoChart !== true) {
        wipAutoChartNames.push(chartName);
      }
      wipMarketsForOneChartByChartName[chartName] = getSubsetOfMarkets(ms, chartConfig.marketsAndOutcomes);
    }
    setMarketsForOneChartByChartName(wipMarketsForOneChartByChartName);
    setAutoChartNames(wipAutoChartNames)
  }, [markets]);

  const styleOuter = {
    padding: "0.2rem",
  };
  const styleInner = {
    border: "1px solid #A5B5C1",
  };
  const styleRight = {
    borderLeft: "1px dotted rgba(165, 181, 193, 0.4)",
  }

  interface MkChartOpts {
    desiredSecondsOfHistory: number;
    columnWidth: number;
    key?: string; // JSX.Element key to use if this chart will be included in a React JSX array
  }

  const defaultMkChartOpts: MkChartOpts = {
    desiredSecondsOfHistory: historySeconds,
    columnWidth: 2,
  };

  function mkChart(ms: Markets | undefined, optsIn?: Partial<MkChartOpts>): JSX.Element {
    const opts = Object.assign({}, defaultMkChartOpts, optsIn || {});
    return (
      <div className={`column is-${opts.columnWidth}`} style={styleOuter} key={opts.key}>
        <div className="columns is-marginless is-paddingless is-mobile" style={styleInner}>
          <div className="column is-6 is-paddingless">
            {ms && <RealTimePriceChart
              markets={ms}
              chartOptions={{
                desiredSecondsOfHistory: opts.desiredSecondsOfHistory * 100,
                hideLastTradePriceGraph: true,
                initialRenderDelayMillis: opts.desiredSecondsOfHistory * 1000, // we want to delay the initial render of the long-term chart because it doesn't physically connect to the short term chart until the short term chart has elapsed its entire time window. If we render the long-term chart immediately then its initial data appear as a weird vertical bar in the middle of the two charts, which is ugly, useless, and users think it's a bug
                colorBlindMode: isColorBlindMode ? true : undefined,
              }}
            />}
          </div>
          <div className="column is-6 is-paddingless" style={styleRight}>
            {ms && <RealTimePriceChart
              markets={ms}
              chartOptions={{
                desiredSecondsOfHistory: opts.desiredSecondsOfHistory,
                hideLegend: true,
                colorBlindMode: isColorBlindMode ? true : undefined,
              }}
            />}
          </div>
        </div>
      </div>
    );
  }

  const chartGroupMaker = (chartNames: string[], opts?: Partial<MkChartOpts>) => chartNames.map(cn => mkChart(marketsForOneChartByChartName[cn], Object.assign({}, opts, {
    key: cn,
  })));
  const mk = chartGroupMaker; // convenience alias

  const electionWinnerChart = mk(["2020winner"], { columnWidth: 6 });
  const autoCharts = mk(autoChartNames);

  const chatStyle = Object.assign({}, isChatHidden ? {
    "display": "none",
  } : {});

  const hideChat = () => {
    setIsChatHidden(true);
    setTimeout(() => {
      try { // hiding chat causes the charts to claim the space used by the chat; a resize event is required to re-render the charts at the new resolution
        window.dispatchEvent(new Event('resize'));
      } catch (e) {
        console.error(e);
      }
    }, 5);
  };
  const showChat = () => {
    setIsChatHidden(false);
    setTimeout(() => {
      try { // showing chat causes the charts to lose the space used by the chat; a resize event is required to re-render the charts at the new resolution
        window.dispatchEvent(new Event('resize'));
      } catch (e) {
        console.error(e);
      }
    }, 5);
  }

  return (
    <div className="dashboard" style={{ minHeight: "100vh" }}>
      <ReactTooltip />
      <Helmet>
        <title>2020 Election Dashboard | Predictions.Global</title>
        <meta
          name="description"
          content="Real-time dashboard for PredictIt and Augur Prediction Markets. PredictIt and Augur prediction market discusion, prices, trading volume, bid ask, and charts." />
      </Helmet>
      <div className="columns has-text-centered is-vcentered is-centered content" style={{ padding: "0.8rem" }}>
        <div className="column is-5">
          <Link to="/">
            <img width="230" className="logo" src="logo.png" />
          </Link>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://catnip.exchange/">
            <span>Catnip Election Market</span>
          </a>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://starspangledgamblers.com/">
            <span>Star Spangled Gamblers</span>
          </a>
        </div>
        <div className="column is-narrow">
          <a href="/how-2020-election-real-time-dashboard-works" target="_blank">How this works</a>
        </div>
        <div className="column is-narrow discord-button">
          <div className="discord-button-inner">
            <a target="_blank" href="https://discord.gg/hXByEjw">
              {/* here we inline the svg for the discord icon so that it can be modified by CSS so we can change the color on hover */}
              <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 245 240"><path d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zM140.9 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1z" /><path d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v135.2c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.5 12.8 11.9 12.1 11.2 21.5 19V40.6c0-11.4-9.2-20.6-20.5-20.6zm-38.6 130.6s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.7-14.7-4.3-2.3-.9-4.8-2-7.3-3.4-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.3-6.7 8.3-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.4-58.3 14.4-58.3 14.4-10.8 28.1-10.5 28.1-10.5l1 1.2c-18 5.2-26.3 13.1-26.3 13.1s2.2-1.2 5.9-2.9c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.1 10.5c0 0 14.4 26.1 14.4 58.3 0 0-8.5 14.5-30.6 15.2z" /></svg>
            </a>
          </div>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://twitter.com/ryanberckmans">
            <i className="fab fa-twitter" />
          </a>
        </div>
        {isChatHidden && <div className="column is-narrow">
          <a onClick={showChat}>show chat</a>
        </div>}
      </div>

      <div className="columns is-marginless">
        <div className={`column is-${isChatHidden ? 12 : 9} is-paddingless`}>
          <div className="columns is-marginless is-multiline" style={{ position: "relative" }}>
            {/* <div className="column is-12">All election winner markets in one chart</div> */}
            {electionWinnerChart}
            {/* <div className="column is-12">Others</div> */}
            {autoCharts}
          </div>
        </div>
        <div className="column is-3" style={Object.assign({
          "position": "relative",
          "zIndex": 10,
          "padding": styleOuter.padding,
        }, isChatHidden ? {
          "display": "none",
        } : {})}>
          <iframe className="chatIframe" src="/orbit-web/index.html" style={chatStyle} />
          <div className="columns has-text-centered is-vcentered is-centered is-multiline content" style={{ padding: "0.8rem" }}>
            <div className="column is-12">
              <a target="_blank" href="0x56329ACd726a373177f8Bf2f94Ca601C0BB3C4FA.png">donate on ethereum: 0x56329ACd726a373177f8Bf2f94Ca601C0BB3C4FA</a>
            </div>
            <div className="column is-12">
              <a onClick={isChatHidden ? showChat : hideChat} style={{ color: "#4a4a4a" /* hide chat is what we hope must users won't do, so we'll make its color less noticeable :> */ }}>{isChatHidden ? 'show' : 'hide'} chat</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
