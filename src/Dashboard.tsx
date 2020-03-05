import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import ReactTooltip from 'react-tooltip';
import { getMarkets } from './PredictItApi';
import { getSubsetOfMarkets, Markets, RealTimePriceChart } from './RealTimePriceChart';

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

  const [markets, setMarkets] = useState(undefined as undefined | Markets);
  const [chart1Markets, setChart1Markets] = useState(undefined as undefined | Markets);
  const [chart1Pt5Markets, setChart1Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart2Markets, setChart2Markets] = useState(undefined as undefined | Markets);
  const [chart3Markets, setChart3Markets] = useState(undefined as undefined | Markets);
  const [chart4Markets, setChart4Markets] = useState(undefined as undefined | Markets);
  const [chart4Pt5Markets, setChart4Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart4Pt6Markets, setChart4Pt6Markets] = useState(undefined as undefined | Markets);
  // const [chart5Markets, setChart5Markets] = useState(undefined as undefined | Markets);
  // const [chart5Pt5Markets, setChart5Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart6Markets, setChart6Markets] = useState(undefined as undefined | Markets);
  const [chart7Markets, setChart7Markets] = useState(undefined as undefined | Markets);
  const [chart8Markets, setChart8Markets] = useState(undefined as undefined | Markets);
  const [chart9Markets, setChart9Markets] = useState(undefined as undefined | Markets);
  const [chart10Markets, setChart10Markets] = useState(undefined as undefined | Markets);
  // const [chart11Markets, setChart11Markets] = useState(undefined as undefined | Markets);
  // const [chart12Markets, setChart12Markets] = useState(undefined as undefined | Markets);
  // const [chart13Markets, setChart13Markets] = useState(undefined as undefined | Markets);
  const [chart14Markets, setChart14Markets] = useState(undefined as undefined | Markets);
  const [chart15Markets, setChart15Markets] = useState(undefined as undefined | Markets);
  // const [chart16Markets, setChart16Markets] = useState(undefined as undefined | Markets);
  const [chart17Markets, setChart17Markets] = useState(undefined as undefined | Markets);
  const [chart18Markets, setChart18Markets] = useState(undefined as undefined | Markets);
  const [chart19Markets, setChart19Markets] = useState(undefined as undefined | Markets);
  const [chart20Markets, setChart20Markets] = useState(undefined as undefined | Markets);
  const [chart21Markets, setChart21Markets] = useState(undefined as undefined | Markets);
  const [chart22Markets, setChart22Markets] = useState(undefined as undefined | Markets);
  const [chart23Markets, setChart23Markets] = useState(undefined as undefined | Markets);
  const [chart24Markets, setChart24Markets] = useState(undefined as undefined | Markets);
  const [chart25Markets, setChart25Markets] = useState(undefined as undefined | Markets);
  const [chart26Markets, setChart26Markets] = useState(undefined as undefined | Markets);

  useEffect(() => {
    const ms = getMarkets();
    setMarkets(ms);
    setChart1Markets(getSubsetOfMarkets(ms, {
      3633: { // Demnom
        outcomeIds: {
          7725: true, // Sanders
          7729: true, // Biden
          // 13871: true, // Bloomberg
          13491: true, // HRC
          7730: true, // Warren
        },
      },
    }));
    setChart1Pt5Markets(getSubsetOfMarkets(ms, {
      3698: { // General election
        outcomeIds: {
          7943: true, // Trump
          7941: true, // Sanders
          7940: true, // Biden
          // 13873: true, // Bloomberg
        },
      },
    }));
    setChart2Markets(getSubsetOfMarkets(ms, {
      6518: { // Warren drops out by 3/6
      },
    }));
    setChart3Markets(getSubsetOfMarkets(ms, {
      6037: { // Idaho primary
        outcomeIds: {
          18389: true, // Sanders
          18385: true, // Biden
        },
      },
    }));
    setChart4Markets(getSubsetOfMarkets(ms, {
      6038: { // MI primary
        outcomeIds: {
          18402: true, // Sanders
          18398: true, // Biden
        },
      },
    }));
    setChart4Pt5Markets(getSubsetOfMarkets(ms, {
      6039: { // Mississipi primary
        outcomeIds: {
          18415: true, // Sanders
          18411: true, // Biden
        },
      },
    }));
    setChart6Markets(getSubsetOfMarkets(ms, {
      6040: { // Missouri primary
        outcomeIds: {
          18428: true, // Sanders
          18424: true, // Biden
        },
      },
    }));
    setChart7Markets(getSubsetOfMarkets(ms, {
      6346: { // North Dakota primary
        outcomeIds: {
          20557: true, // Sanders
          20553: true, // Biden
        },
      },
    }));
    setChart8Markets(getSubsetOfMarkets(ms, {
      6041: { // WA primary
        outcomeIds: {
          18441: true, // Sanders
          18437: true, // Biden
        },
      },
    }));
    setChart9Markets(getSubsetOfMarkets(ms, {
      6328: { // OR primary
        outcomeIds: {
          20391: true, // Sanders
          20387: true, // Biden
        },
      },
    }));
    setChart10Markets(getSubsetOfMarkets(ms, {
      6102: { // NY primary
        outcomeIds: {
          18920: true, // Sanders
          18916: true, // Biden
        },
      },
    }));
    setChart4Pt6Markets(getSubsetOfMarkets(ms, {
      6364: { // Dems Abroad primary
        outcomeIds: {
          20686: true, // Sanders
          20683: true, // Biden
          // 20694: true, // Bloomberg
          // 20687: true, // Warren
        },
      },
    }));
    setChart14Markets(getSubsetOfMarkets(ms, {
      5883: { // Dem VP Nominee
        outcomeIds: {
          17474: true, // Harris
          17481: true, // Abrams
          17472: true, // Klobuchar
          17477: true, // Warren
          17480: true, // Buttigieg
          20451: true, // Turner
        },
      },
    }));
    setChart15Markets(getSubsetOfMarkets(ms, {
      6168: { // Brokered convention
      },
    }));
    setChart17Markets(getSubsetOfMarkets(ms, {
      4614: { // Hillary run for president in 2020
      },
    }));
    setChart18Markets(getSubsetOfMarkets(ms, {
      3390: { // Trump GOP nominee
      },
    }));
    setChart19Markets(getSubsetOfMarkets(ms, {
      5886: { // Pence GOP VP nominee
      },
    }));
    setChart20Markets(getSubsetOfMarkets(ms, {
      5554: { // Trump popular vote
      },
    }));
    setChart21Markets(getSubsetOfMarkets(ms, {
      2721: { // Which party wins presidency
        outcomeIds: {
          4389: true, // Republican
          4390: true, // Democratic
        },
      },
    }));
    setChart22Markets(getSubsetOfMarkets(ms, {
      4353: { // Balance of power after general
      },
    }));
    setChart23Markets(getSubsetOfMarkets(ms, {
      4365: { // Which party controls house after general
        outcomeIds: {
          10463: true, // Republican
          10461: true, // Democratic
        },
      },
    }));
    setChart24Markets(getSubsetOfMarkets(ms, {
      4366: { // Which party controls senate after general
        outcomeIds: {
          10464: true, // Republican
          10462: true, // Democratic
        },
      },
    }));
    setChart25Markets(getSubsetOfMarkets(ms, {
      4292: { // Trump 1st term recession?
      },
    }));
    setChart26Markets(getSubsetOfMarkets(ms, {
      6489: { // COVID pandemic by 3/6?
      },
    }));
    // setChart14Markets(getSubsetOfMarkets(ms, {
    //   0: { // Dem VP Nominee
    //     outcomeIds: {
    //       0: true, // Harris
    //       0: true, // Abrams
    //       0: true, // Klobuchar
    //       0: true, // Warren
    //       0: true, // Buttigieg
    //       0: true, // Turner
    //     },
    //   },
    // }));
  }, [markets]);

  const styleOuter = {
    padding: "0.4rem",
  };
  const styleInner = {
    border: "1px solid #A5B5C1",
  };
  const styleRight = {
    borderLeft: "1px dotted rgba(165, 181, 193, 0.4)",
  }
  function mkChart(ms: Markets | undefined, desiredSecondsOfHistory: number) {
    return (
      <div className="column is-3" style={styleOuter}>
        <div className="columns is-marginless is-paddingless is-mobile" style={styleInner}>
          <div className="column is-6 is-paddingless">
            {ms && <RealTimePriceChart
              markets={ms}
              chartOptions={{
                desiredSecondsOfHistory: desiredSecondsOfHistory * 100,
                hideLastTradePriceGraph: true,
                initialRenderDelayMillis: desiredSecondsOfHistory * 1000, // we want to delay the initial render of the long-term chart because it doesn't physically connect to the short term chart until the short term chart has elapsed its entire time window. If we render the long-term chart immediately then its initial data appear as a weird vertical bar in the middle of the two charts, which is ugly, useless, and users think it's a bug
                colorBlindMode: isColorBlindMode ? true : undefined,
              }}
            />}
          </div>
          <div className="column is-6 is-paddingless" style={styleRight}>
            {ms && <RealTimePriceChart
              markets={ms}
              chartOptions={{
                desiredSecondsOfHistory,
                hideLegend: true,
                colorBlindMode: isColorBlindMode ? true : undefined,
              }}
            />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard" style={{ minHeight: "100vh" }}>
      <ReactTooltip />
      <Helmet>
        <title>PredictIt Dashboard | Predictions.Global</title>
        <meta
          name="description"
          content="Dashboard for PredictIt and Augur Prediction Markets. PredictIt and Augur prediction market discusion, prices, trading volume, bid ask, and charts." />
      </Helmet>
      <div className="columns has-text-centered is-vcentered is-centered content" style={{ padding: "0.8rem" }}>
        <div className="column is-half">
          <Link to="/">
            <img width="230" className="logo" src="logo.png" />
          </Link>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://discord.gg/hXByEjw">
            <img width="30" src="discord-button.svg" />
          </a>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://discord.gg/hXByEjw">
            <span>DM @ryanb</span>
          </a>
        </div>
        <div className="column is-narrow">
          <a target="_blank" href="https://forms.gle/TXpxBaWNhD2JkGfaA">
            <span>Send Feedback (or say Hi)</span>
          </a>
        </div>
        <div className="column is-narrow">
          <div data-multiline={true} data-place='bottom' data-tip={`The big dots🔵are last trade price.<br>The two lines📉with the same color are bid & ask.<br>Each chart has a 2-hour timescale on left, 1-min timescale on right, left side moves slow, right side really fast.<br>Right now it only shows new data, no history... but you can leave the tab open and left side will build up 2 hours of history.<br>Try it on your phone`} style={{ color: "#3273DC" }}>
            Hot Tips
            &nbsp;
          <i className="far fa-question-circle" />
          </div>

        </div>
      </div>

      <div className="columns is-marginless is-multiline">
        {mkChart(chart2Markets, historySeconds)}
        {mkChart(chart4Pt6Markets, historySeconds)}
        {mkChart(chart3Markets, historySeconds)}
        {mkChart(chart4Markets, historySeconds)}
        {mkChart(chart6Markets, historySeconds)}
        {mkChart(chart4Pt5Markets, historySeconds)}
        {mkChart(chart7Markets, historySeconds)}
        {mkChart(chart10Markets, historySeconds) /* NY */}
        {mkChart(chart9Markets, historySeconds) /* OR */}
        {mkChart(chart8Markets, historySeconds) /* WA */}
        {mkChart(chart1Markets, historySeconds)}
        {mkChart(chart14Markets, historySeconds)}
        {mkChart(chart1Pt5Markets, historySeconds)}
        {mkChart(chart15Markets, historySeconds)}
        {mkChart(chart17Markets, historySeconds)}
        {mkChart(chart18Markets, historySeconds)}
        {mkChart(chart19Markets, historySeconds)}
        {mkChart(chart20Markets, historySeconds)}
        {mkChart(chart21Markets, historySeconds)}
        {mkChart(chart22Markets, historySeconds)}
        {mkChart(chart23Markets, historySeconds)}
        {mkChart(chart24Markets, historySeconds)}
        {mkChart(chart25Markets, historySeconds)}
        {mkChart(chart26Markets, historySeconds)}
      </div>
    </div>
  );
}
