import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore for Rickshaw which has no TypeScript types (the @types/rickshaw package is a stub and broken)
import * as Rickshaw from 'rickshaw';
import '../node_modules/rickshaw/rickshaw.css';
import { Observer, Unsubscribe } from './Components/observer';
import "./RealTimePriceChart.css";

/*
WARNING rickshaw breaks with webpack minification, I temporarily applied a fix directly to node_modules/react-scripts-ts/config/webpack.config.prod.js but the longer term fix is to stop using rickshaw, figure out how shutterstock solves this problem, or, most likely, fork react-scripts and apply this fix to my fork.

TODO Facebook recommends forking react-scripts, and fixing this issue in my private fork, rather than ejecting from create-react-app https://create-react-app.dev/docs/alternatives-to-ejecting

To make rickshaw build for production create-react-app, I directly modified node_modules/react-scripts-ts/config/webpack.config.prod.js

uglifyOptions:
  mangle: {
    safari10: true,
    reserved: ["$super"], // added this line or rickshaw breaks on minification because rickshaw is a fairly old javascript library that uses old-style (pre-ES6) class hierarchies that rely on a variable named "$super", it breaks if that variable is renamed during minification. I wonder if Shutterstock still uses or recommends rickshaw, how did they solve this? https://webpack.js.org/plugins/uglifyjs-webpack-plugin/#uglifyoptions https://stackoverflow.com/questions/31694685/make-gulp-uglify-not-mangle-only-one-variable https://github.com/shutterstock/rickshaw/issues/52
  },

Bottom line --> `reserved: ["$super"]` seems to be working, I can observe the token "$super" in the minified prod code, and also the site works now in prod build.
*/

interface Props {
  markets: Markets;
  desiredSecondsOfHistory: number;
}

export interface Markets {
  marketsById: { [marketId: string]: Market },
}

export interface Market {
  name: string;
  imageUrl: string;
  url: string;
  outcomesById: { [outcomeId: string]: Outcome },
}

export interface Outcome {
  name: string;
  imageUrl: string;
  initialPrices: OutcomePrices;
  observer: Observer<OutcomePrices>;
}

export interface OutcomePrices {
  bestBidPrice: number;
  bestAskPrice: number;
  lastTradePrice: number;
}

export function getSubsetOfMarkets(markets: Markets, marketsAndOutcomes: { [marketId: string]: { [outcomeId: string]: true } }): Markets {
  // console.log("getSubsetOfMarketsIn", markets);
  const ms = {
    marketsById: {},
  };
  Object.keys(marketsAndOutcomes).forEach(marketId => {
    const m: Market = Object.assign({}, markets.marketsById[marketId], {
      outcomesById: {},
    });
    Object.keys(marketsAndOutcomes[marketId]).forEach(outcomeId => {
      m.outcomesById[outcomeId] = markets.marketsById[marketId].outcomesById[outcomeId];
    });
    ms.marketsById[marketId] = m;
  })
  // console.log("getSubsetOfMarkets", ms);
  return ms;
}

interface LegendItemProps {
  market: Market;
  colorWheel: () => string;
}

const LegendItem: React.SFC<LegendItemProps> = ({ market, colorWheel }) => {
  return (<>
    <img src={market.imageUrl} />
    &nbsp;
    <span className="marketName">{market.name}</span>
    {Object.keys(market.outcomesById).map(outcomeId => {
      const outcome = market.outcomesById[outcomeId];
      return (<span key={outcomeId} style={{ display: "inline-block" }}>
        &nbsp;&nbsp;
        <img src={outcome.imageUrl} />
        &nbsp;
        <span style={{ color: colorWheel() }}>{outcome.name}</span>
      </span>);
    })}
    <br />
  </>);
}

export const RealTimePriceChart: React.SFC<Props> = ({ markets, desiredSecondsOfHistory }: Props) => {
  // console.log("RealTimePriceChart", markets);
  const chart = useChart(markets, desiredSecondsOfHistory);

  // TODO wrap this observer subscription process into a standalone hook
  useEffect(() => {
    if (chart === undefined || chart.updatePrices === undefined) {
      // console.log("RealTimePriceChart not subscribing to observers because chart isn't ready for updates");
      return;
    }
    const updatePrices = chart.updatePrices;
    // console.log("RealTimePriceChart subscribing to observers because chart is ready for updates", chart);
    const unsubs: Unsubscribe[] = [];
    Object.keys(markets.marketsById).forEach(marketId => {
      Object.keys(markets.marketsById[marketId].outcomesById).forEach(outcomeId => {
        unsubs.push(markets.marketsById[marketId].outcomesById[outcomeId].observer.subscribe((newPrices: OutcomePrices) => {
          // console.log(`${marketId}-${outcomeId}`, newPrices);
          updatePrices(outcomeId, newPrices);
        }).unsubscribe);
      });
    });
    return () => {
      // console.log("RealTimePriceChart unsubscribing N times, N=", unsubs.length);
      unsubs.forEach(unsub => unsub());
    };
  }, [markets, chart && chart.updatePrices]);

  return chart && chart.domNode ? chart.domNode : <div />;
}

interface Chart {
  domNode: React.ReactElement; // rendered chart to insert into DOM
  updatePrices?: (outcomeId: string, newPrices: OutcomePrices) => void; // client should push new prices into this function to cause them to be rendered into the chart in real time
}

// TODO associate candidates with colors, so that Bernie is always blue, regardless of which market is being displayed.
const globalColorScheme = [ // rickshaw color scheme, colors appear twice because each outcome has two lines, bid and ask
  'lightcoral',
  'lightcoral',
  'darkturquoise',
  'darkturquoise',
  'goldenrod',
  'goldenrod',
  'darkorange',
  'darkorange',
  'hotpink',
  'hotpink',
  'greenyellow',
  'greenyellow',
];

// getColorWheel returns a generator for a stream of colors for the passed
// colorScheme. A client can use getColorWheel to get the same deterministic
// series of colors for a list of outcomes that the underlying chart will use.
function getColorWheel(colorScheme: string[]): () => string {
  let i = 0;
  return () => {
    const j = i;
    i += 2;
    i = i % colorScheme.length;
    return colorScheme[j];
  };
}

// useChart is a hook to encapsulate our use of Rickshaw. Right now the useEffect will instantiate a Chart.domNode and requires the client to mount this domNode while this function has an interval that checks if the domNode has been mounted. TODO another, faster, simpler, less brittle approach might be to create the dom node here, and not use refs, and create the rickshaw graph on an unmounted dom node, and then return the whole thing fully constructed.
function useChart(ms: Markets, desiredSecondsOfHistory: number): Chart | undefined {
  const timeIntervalMillis: number = (() => { // milliseconds, lower is better, but lower affects render performance and graphs will drift from real time. Render performance because of how long each render takes, but also the total number of data points on the graph
    if (desiredSecondsOfHistory < 121) {
      return 1000;
    }
    return 10000;
  })();

  // console.log("useChart");
  const marketIds = Object.keys(ms.marketsById);
  if (marketIds.length < 1) {
    // console.warn("useChart got empty marketIds");
    return undefined;
  }
  const chartRef = useRef<HTMLDivElement>(null);
  const chart2Ref = useRef<HTMLDivElement>(null);
  const [chartDomNodeMounted, setChartDomNodeMounted] = useState(false);
  const [chart, setChart] = useState(undefined as Chart | undefined);

  useEffect(() => {
    // console.log("useChart useEffect", chartRef, chart2Ref);

    const colorWheel = getColorWheel(globalColorScheme); // TODO pass colorScheme in useChart options
    const domNode = (
      <a href={marketIds.length > 0 ? ms.marketsById[marketIds[0]].url : ""} target="_blank">
        <div className="rickshawChartContainer">
          <div className="rickshawChart" ref={chartRef} />
          <div className="rickshawChart2" ref={chart2Ref} />
          <div className="rickshawChartLegend">
            {marketIds.map(id => <LegendItem key={id} market={ms.marketsById[id]} colorWheel={colorWheel} />)}
          </div>
        </div>
      </a>
    );

    if (chartRef.current === null || chart2Ref.current === null) {
      const checkForDomNodeMountInterval = window.setInterval(() => {
        if (chartRef.current !== null && chart2Ref.current !== null) {
          // console.log('checkForDomNodeMountInterval saw dom node mount');
          setChartDomNodeMounted(true);
          clearInterval(checkForDomNodeMountInterval);
        }
      }, 50);

      // chart dom not yet created, we'll setChart with the dom node so that the client can mount it, and then later we'll rerun this effect and create the graph
      setChart({
        domNode,
        updatePrices: undefined,
      });
      return () => {
        window.clearInterval(checkForDomNodeMountInterval);
      };
    }
    const chartDiv = chartRef.current;
    const chart2Div = chart2Ref.current;

    function getChartElementWidthAndHeight() {
      const d = {
        width: chartDiv.clientWidth,
        height: chartDiv.clientHeight,
      };
      return d;
    }

    interface SeriesInit {
      // For some reason Rickshaw throws an error if we provide an initial data point in the `data` field, which Rickshaw consumes and sets. Instead it's best to provide initialDatum via a manual call to updatePrices, done below.
      name: string,
      outcomeId: string,
      bidOrAsk: 'bid' | 'ask',
    }
    const mostRecentOutcomePricesByOutcomeId: { [outcomeId: string]: OutcomePrices } = {};
    const seriesNameByOutcomeId: { [outcomeId: string]: { [bidOrAsk in 'bid' | 'ask']: string } } = {};
    const series: SeriesInit[] = marketIds.reduce<SeriesInit[]>((sis, marketId) => {
      Object.keys(ms.marketsById[marketId].outcomesById).forEach(outcomeId => {
        // Each Outcome will result in two series, a bid series and an ask series. For example a market (DemNom = Biden x Sanders) will have four series, Biden-bid, Biden-ask, Sanders-bid, Sanders-ask.
        const outcome = ms.marketsById[marketId].outcomesById[outcomeId];
        const bidName = outcome.name + " bid";
        const askName = outcome.name + " ask";
        const siBid: SeriesInit = {
          name: bidName,
          outcomeId,
          bidOrAsk: 'bid',
        };
        const siAsk: SeriesInit = {
          name: askName,
          outcomeId,
          bidOrAsk: 'ask',
        };
        seriesNameByOutcomeId[outcomeId] = {
          bid: bidName,
          ask: askName,
        };
        mostRecentOutcomePricesByOutcomeId[outcomeId] = outcome.initialPrices;
        sis.push(siBid);
        sis.push(siAsk);
      });
      return sis;
    }, []);

    const maxDataPoints = Math.round(desiredSecondsOfHistory * 1000 / timeIntervalMillis);
    const graph = new Rickshaw.Graph(Object.assign({
      element: chartDiv,
      renderer: 'line',
      min: 0, // y-axis min value, ie. $0
      max: 1, // y-axis max value, $1
      interpolation: 'step-after', // line smoothing / interpolation method, square steps from point to point, https://github.com/mbostock/d3/wiki/SVG-Shapes#wiki-line_interpolate
      series: new Rickshaw.Series.FixedDuration(series, {
        // these are args for https://github.com/shutterstock/rickshaw/blob/master/src/js/Rickshaw.Color.Palette.js
        scheme: globalColorScheme,
      }, {
          timeInterval: timeIntervalMillis,
          maxDataPoints,
          timeBase: new Date().getTime() / 1000,
        })
    }, getChartElementWidthAndHeight()));

    const hoverDetail = new Rickshaw.Graph.HoverDetail({
      graph,
      yFormatter: (y: number) => `${Math.round(y * 100)}¢`,
    });
    // Override formatter https://github.com/shutterstock/rickshaw/blob/master/src/js/Rickshaw.Graph.HoverDetail.js#L34
    hoverDetail.formatter = (series2: any, _x: any, _y: any, _formattedX: any, formattedY: any, _d: any) => `${series2.name}&nbsp;${formattedY}`;

    // xAxisTickPeriodSeconds is the number of seconds between each x axis tick. We determine this value dynamically so as to show a pleasing and useful number of ticks regardless of x axis timescale.
    const xAxisTickPeriodSeconds: number = (() => {
      const simultaneousTicks = 4; // number of ticks that should show simultaneously on the chart
      const tickPeriod = Math.floor(desiredSecondsOfHistory/simultaneousTicks);
      const tickPeriodRoundedUpToNearestMinute = tickPeriod - (tickPeriod % 60) + 60;
      return Math.max(60, tickPeriodRoundedUpToNearestMinute); // no more often than one tick per 60 seconds
    })();
    const xAxis = new Rickshaw.Graph.Axis.Time({
      graph,
      timeFixture: new Rickshaw.Fixtures.Time.Local(),
      timeUnit: {
        name: 'custom',
        seconds: xAxisTickPeriodSeconds,
        formatter: formatAMPM,
      },
    });
    xAxis.render();

    function render() {
      // WARNING - the way Rickshaw FixedDuration graphs work is they don't keep track of the passage of time internally, nor will they automatically duplicate a data point that hasn't changed since the last rerender. To properly rerender we must 1. render on an interval equal to the timeInterval passed to graph, 2. pass latest data points prior to each rerender, even if there have been no changes.
      const data = {};
      Object.keys(mostRecentOutcomePricesByOutcomeId).forEach(outcomeId => {
        data[seriesNameByOutcomeId[outcomeId].bid] = mostRecentOutcomePricesByOutcomeId[outcomeId].bestBidPrice;
        data[seriesNameByOutcomeId[outcomeId].ask] = mostRecentOutcomePricesByOutcomeId[outcomeId].bestAskPrice;
      });
      graph.series.addData(data);
      graph.render();
      graph2.render();
    }
    // Using setInterval accumulates O(# of times rendered) drift with respect to real passage of time. This technique reduces the drift to a constant amount. https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript
    let expectedRenderTime = Date.now() + timeIntervalMillis;
    let graphRenderInterval = window.setTimeout(function step() {
      const now = Date.now();
      const delta = now - expectedRenderTime;
      render();
      expectedRenderTime += timeIntervalMillis;
      const nextInterval = Math.max(0, timeIntervalMillis - delta);
      // We'll see delta monotonically increase if the browser can't render our charts fast enough to keep up with the render loop timing. A fix here is to increase timeInterval.
      if (delta > 1000) {
        // console.log("now", now, "expected", expectedRenderTime, "delta", delta);
      }
      graphRenderInterval = window.setTimeout(step, nextInterval);
    }, timeIntervalMillis); // WARNING the timeInterval for the re-render must be the same as the timeInterval passed to the graph

    const updatePrices = (outcomeId: string, newPrices: OutcomePrices) => {
      // console.log("graph getting live data", newPrices);
      mostRecentOutcomePricesByOutcomeId[outcomeId] = newPrices;
      graph2.series[graph2SeriesIndexByOutcomeId[outcomeId]].data = [{ x: 36, y: newPrices.lastTradePrice }];
    };

    // Last trade price chart2/graph2
    function getChart2ElementWidthAndHeight() {
      const wh = getChartElementWidthAndHeight();
      return {
        height: wh.height,
        width: wh.width * 0.08,
      };
    }

    // TODO make this strongly typed
    const graph2SeriesIndexByOutcomeId: { [outcomeId: string]: number } = {};
    const graph2Series: object[] = (() => {
      const colorWheel2 = getColorWheel(globalColorScheme);
      const s = [{
        // this first series is a hack to set the X axis domain from [0,11] which causes the subsequent series' x values of 6 to be in the middle of the X axis domain, which has the effect of rendering the last trade price dot on the right margin of the price chart
        name: "dummy",
        color: "#ffffff",
        data: [{ x: 0, y: -5 }, { x: 71, y: -5 }],
      }];
      let i = 1; // starts at 1 because the dummy series is 0
      marketIds.forEach((marketId) => {
        Object.keys(ms.marketsById[marketId].outcomesById).forEach(outcomeId => {
          const outcome = ms.marketsById[marketId].outcomesById[outcomeId];
          s.push({
            name: outcome.name + " last",
            color: colorWheel2(),
            data: [{ x: 36, y: outcome.initialPrices.lastTradePrice }],
          });
          graph2SeriesIndexByOutcomeId[outcomeId] = i;
          i += 1;
        });
      });
      return s;
    })();

    const graph2 = new Rickshaw.Graph(Object.assign({
      element: chart2Div,
      renderer: 'scatterplot',
      min: 0, // y-axis min value, ie. $0
      max: 1, // y-axis max value, $1
      series: graph2Series,
    }, getChart2ElementWidthAndHeight()));

    // Cache nowUTCString once per second, otherwise hoverDetail2.xFormatter will recompute it each render.
    let nowUTCString = new Date().toUTCString();
    // TODO use a stepping technique as done with graph render interval -- this interval will drift a lot over time and become materially incorrect
    const nowUTCInterval = window.setInterval(() => nowUTCString = new Date().toUTCString(), 1000);

    const hoverDetail2 = new Rickshaw.Graph.HoverDetail({
      graph: graph2,
      xFormatter: (_x: any) => nowUTCString,
      yFormatter: (y: number) => `${Math.round(y * 100)}¢`,
    });
    // Override formatter https://github.com/shutterstock/rickshaw/blob/master/src/js/Rickshaw.Graph.HoverDetail.js#L34
    hoverDetail2.formatter = (series2: any, _x: any, _y: any, _formattedX: any, formattedY: any, _d: any) => `${series2.name} last &nbsp;${formattedY}`;

    const onResize = () => {
      graph.configure(getChartElementWidthAndHeight());
      graph.render();

      const wh = getChart2ElementWidthAndHeight()
      graph2.configure(getChart2ElementWidthAndHeight());
      graph2.renderer.dotSize = Math.min(10, Math.max(6, Math.round(wh.height * 0.04)));
      graph2.render();
    };
    window.addEventListener("resize", onResize);
    onResize();

    setChart({
      domNode,
      updatePrices,
    });

    return () => {
      window.clearInterval(nowUTCInterval);
      window.clearInterval(graphRenderInterval);
      window.removeEventListener("resize", onResize);
    };
  }, [ms, chartDomNodeMounted]);

  return chart;
}

// https://stackoverflow.com/questions/8888491/how-do-you-display-javascript-datetime-in-12-hour-am-pm-format
function formatAMPM(date: Date) {
  let hours = date.getHours();
  let minutes: any = date.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  const strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}
