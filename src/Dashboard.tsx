import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import ReactTooltip from 'react-tooltip';
import { getMarkets } from './PredictItApi';
import { getSubsetOfMarkets, Markets, RealTimePriceChart } from './RealTimePriceChart';

export const Dashboard: React.SFC<{}> = (props) => {
  const historySeconds: number = (() => {
    const raw = queryString.parse((props as any).location.search).historySeconds;
    const raw2 = typeof raw === 'string' ? parseInt(raw, 10) : NaN;
    return isNaN(raw2) ? 72 : raw2;
  })();

  const [markets, setMarkets] = useState(undefined as undefined | Markets);
  const [chart1Markets, setChart1Markets] = useState(undefined as undefined | Markets);
  const [chart1Pt5Markets, setChart1Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart2Markets, setChart2Markets] = useState(undefined as undefined | Markets);
  const [chart3Markets, setChart3Markets] = useState(undefined as undefined | Markets);
  const [chart4Markets, setChart4Markets] = useState(undefined as undefined | Markets);
  const [chart4Pt5Markets, setChart4Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart4Pt6Markets, setChart4Pt6Markets] = useState(undefined as undefined | Markets);
  const [chart5Markets, setChart5Markets] = useState(undefined as undefined | Markets);
  const [chart5Pt5Markets, setChart5Pt5Markets] = useState(undefined as undefined | Markets);
  const [chart6Markets, setChart6Markets] = useState(undefined as undefined | Markets);
  const [chart7Markets, setChart7Markets] = useState(undefined as undefined | Markets);
  const [chart8Markets, setChart8Markets] = useState(undefined as undefined | Markets);
  const [chart9Markets, setChart9Markets] = useState(undefined as undefined | Markets);
  const [chart10Markets, setChart10Markets] = useState(undefined as undefined | Markets);
  const [chart11Markets, setChart11Markets] = useState(undefined as undefined | Markets);
  const [chart12Markets, setChart12Markets] = useState(undefined as undefined | Markets);
  const [chart13Markets, setChart13Markets] = useState(undefined as undefined | Markets);

  useEffect(() => {
    const ms = getMarkets();
    setMarkets(ms);
    setChart1Markets(getSubsetOfMarkets(ms, {
      3633: { // Demnom
        7725: true, // Sanders
        7729: true, // Biden
        13871: true, // Bloomberg
        13491: true, // HRC
        7730: true, // Warren
        // 7734: true, // Klobuchar
      },
    }));
    setChart1Pt5Markets(getSubsetOfMarkets(ms, {
      3698: { // General election
        7943: true, // Trump
        7941: true, // Sanders
        7940: true, // Biden
        13873: true, // Bloomberg
      },
    }));
    setChart2Markets(getSubsetOfMarkets(ms, {
      5932: { // Alabama primary
        17779: true, // Sanders
        17775: true, // Biden
        19009: true, // Bloomberg
        17780: true, // Warren
        // 17781: true, // Klobuchar
      },
    }));
    setChart3Markets(getSubsetOfMarkets(ms, {
      5939: { // Arkansas primary
        17870: true, // Sanders
        17866: true, // Biden
        19022: true, // Bloomberg
        17871: true, // Warren
        // 17872: true, // Klobuchar
      },
    }));
    setChart4Markets(getSubsetOfMarkets(ms, {
      5823: { // California primary
        17116: true, // Sanders
        17112: true, // Biden
        19028: true, // Bloomberg
        17117: true, // Warren
        // 17118: true, // Klobuchar
      },
    }));
    setChart4Pt5Markets(getSubsetOfMarkets(ms, {
      5933: { // CO primary
        17792: true, // Sanders
        17788: true, // Biden
        19016: true, // Bloomberg
        17793: true, // Warren
      },
    }));
    setChart4Pt6Markets(getSubsetOfMarkets(ms, {
      6364: { // Dems Abroad primary
        20686: true, // Sanders
        20683: true, // Biden
        20694: true, // Bloomberg
        20687: true, // Warren
      },
    }));
    setChart5Markets(getSubsetOfMarkets(ms, {
      5934: { // Maine primary
        17805: true, // Sanders
        17801: true, // Biden
        19017: true, // Bloomberg
        17806: true, // Warren
        // 17807: true, // Klobuchar
      },
    }));
    setChart5Pt5Markets(getSubsetOfMarkets(ms, {
      5822: { // MA primary
        17104: true, // Sanders
        17100: true, // Biden
        19027: true, // Bloomberg
        17105: true, // Warren
      },
    }));
    setChart6Markets(getSubsetOfMarkets(ms, {
      5942: { // MN primary
        17909: true, // Sanders
        17905: true, // Biden
        19025: true, // Bloomberg
        17910: true, // Warren
        // 17911: true, // Klobuchar
      },
    }));
    setChart7Markets(getSubsetOfMarkets(ms, {
      5943: { // NC primary
        17922: true, // Sanders
        17918: true, // Biden
        19026: true, // Bloomberg
        17923: true, // Warren
        // 17924: true, // Klobuchar
      },
    }));
    setChart8Markets(getSubsetOfMarkets(ms, {
      5941: { // OK primary
        17896: true, // Sanders
        17892: true, // Biden
        19024: true, // Bloomberg
        17897: true, // Warren
        // 17898: true, // Klobuchar
      },
    }));
    setChart9Markets(getSubsetOfMarkets(ms, {
      5940: { // TN primary
        17883: true, // Sanders
        17879: true, // Biden
        19023: true, // Bloomberg
        17884: true, // Warren
        // 17885: true, // Klobuchar
      },
    }));
    setChart10Markets(getSubsetOfMarkets(ms, {
      5938: { // TX primary
        17857: true, // Sanders
        17853: true, // Biden
        19021: true, // Bloomberg
        17858: true, // Warren
        // 17859: true, // Klobuchar
      },
    }));
    setChart11Markets(getSubsetOfMarkets(ms, {
      5937: { // UT primary
        17844: true, // Sanders
        17840: true, // Biden
        19020: true, // Bloomberg
        17845: true, // Warren
        // 17846: true, // Klobuchar
      },
    }));
    setChart12Markets(getSubsetOfMarkets(ms, {
      5936: { // VT primary
        17831: true, // Sanders
        17827: true, // Biden
        19019: true, // Bloomberg
        17832: true, // Warren
        // 17833: true, // Klobuchar
      },
    }));
    setChart13Markets(getSubsetOfMarkets(ms, {
      5935: { // VA primary
        17818: true, // Sanders
        17814: true, // Biden
        19018: true, // Bloomberg
        17819: true, // Warren
        // 17820: true, // Klobuchar
      },
    }));
    // setChart4Markets(getSubsetOfMarkets(ms, {
    //   0: { // Maine primary
    //     0: true, // Sanders
    //     0: true, // Biden
    //     0: true, // Bloomberg
    //     0: true, // Warren
    //     0: true, // Klobuchar
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
    borderLeft: "1px solid #A5B5C1",
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
              }}
            />}
          </div>
          <div className="column is-6 is-paddingless" style={styleRight}>
            {ms && <RealTimePriceChart
              markets={ms}
              chartOptions={{
                desiredSecondsOfHistory,
                hideLegend: true,
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
          <img width="230" className="logo" src="logo.png" />
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
        {mkChart(chart3Markets, historySeconds)}
        {mkChart(chart4Markets, historySeconds)}
        {mkChart(chart4Pt5Markets, historySeconds)}
        {mkChart(chart4Pt6Markets, historySeconds)}
        {mkChart(chart5Markets, historySeconds)}
        {mkChart(chart5Pt5Markets, historySeconds)}
        {mkChart(chart6Markets, historySeconds)}
        {mkChart(chart7Markets, historySeconds)}
        {mkChart(chart8Markets, historySeconds)}
        {mkChart(chart9Markets, historySeconds)}
        {mkChart(chart10Markets, historySeconds)}
        {mkChart(chart11Markets, historySeconds)}
        {mkChart(chart12Markets, historySeconds)}
        {mkChart(chart13Markets, historySeconds)}
        {mkChart(chart1Markets, historySeconds)}
        {mkChart(chart1Pt5Markets, historySeconds)}
      </div>
    </div>
  );
}
