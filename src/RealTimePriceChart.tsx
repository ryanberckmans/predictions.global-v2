import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore for Rickshaw which has no TypeScript types (the @types/rickshaw package is a stub and broken)
import * as Rickshaw from 'rickshaw';
import '../node_modules/rickshaw/rickshaw.css';
import { Observer, Unsubscribe } from './Components/observer';
import { ContractUpdate } from './PredictItApi';
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

interface ChartOptions {
  desiredSecondsOfHistory: number;
  hideLegend?: true;
  hideLastTradePriceGraph?: true;
  initialRenderDelayMillis?: number;
  colorBlindMode?: true;
}

interface Props {
  markets: Markets;
  chartOptions: ChartOptions;
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
  initialPrices: ContractUpdate;
  observer: Observer<ContractUpdate>; // ContractUpdate is a PI-specific structure, it extends OutcomePrices
}

export interface OutcomePrices {
  bestBidPrice: number;
  bestAskPrice: number;
  lastTradePrice: number;
}

export function getSubsetOfMarkets(markets: Markets, marketsAndOutcomes: { [marketId: string]: {
  autoOutcomeMaxNum?: number,
  outcomeIds?: {[outcomeId: string]: true },
}}): Markets {
  // console.log("getSubsetOfMarketsIn", markets, marketsAndOutcomes);
  const ms = {
    marketsById: {},
  };
  Object.keys(marketsAndOutcomes).forEach(marketId => {
    const m: Market = Object.assign({}, markets.marketsById[marketId], {
      outcomesById: {},
    });
    const outcomeIds: string[] = marketsAndOutcomes[marketId].autoOutcomeMaxNum !== undefined ?
      // Select the first `autoOutcomeMaxNum` market outcomes
      Object.keys(markets.marketsById[marketId].outcomesById).slice(0, marketsAndOutcomes[marketId].autoOutcomeMaxNum) :
      Object.keys(
        marketsAndOutcomes[marketId].outcomeIds || // Select the subset of market outcomes provided by caller
        markets.marketsById[marketId].outcomesById // Default to all outcomes for this market
      );
    outcomeIds.forEach(outcomeId => m.outcomesById[outcomeId] = markets.marketsById[marketId].outcomesById[outcomeId]);
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
    {getAndSortOutcomeIdsByContent(market).map(outcomeId => {
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

export const RealTimePriceChart: React.SFC<Props> = ({ markets, chartOptions }: Props) => {
  // console.log("RealTimePriceChart", markets);
  const chart = useChart(markets, chartOptions);

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
        unsubs.push(markets.marketsById[marketId].outcomesById[outcomeId].observer.subscribe((newPrices: ContractUpdate) => {
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
  updatePrices?: (outcomeId: string, newPrices: ContractUpdate) => void; // client should push new prices into this function to cause them to be rendered into the chart in real time
}

const defaultColorScheme = [ // rickshaw color scheme, colors appear twice because each outcome has two lines, bid and ask
  // colors from http://ksrowell.com/blog-visualizing-data/2012/02/02/optimal-colors-for-graphs/
  'rgb(57, 106, 177)',
  'rgb(57, 106, 177)',
  'rgb(218, 124, 48)',
  'rgb(218, 124, 48)',
  'rgb(62, 150, 81)',
  'rgb(62, 150, 81)',
  'rgb(204, 37, 41)',
  'rgb(204, 37, 41)',
  'rgb(107, 76, 154)',
  'rgb(107, 76, 154)',
  'rgb(83, 81, 84)',
  'rgb(83, 81, 84)',
];

const colorBlindColorScheme = [
  // similar to and based on globalColorScheme, but with select colors replaced based on talking to color blind users
  'rgb(57, 106, 177)',
  'rgb(57, 106, 177)',
  'yellow',
  'yellow',
  'rgb(62, 150, 81)',
  'rgb(62, 150, 81)',
  'rgb(204, 37, 41)',
  'rgb(204, 37, 41)',
  'rgb(107, 76, 154)',
  'rgb(107, 76, 154)',
  'rgb(83, 81, 84)',
  'rgb(83, 81, 84)',
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

const contentOrder = [
  'Democratic',
  'Republican',
  'Biden',
  'Sanders',
  'Warren',
  'Bloomberg',
  'Clinton',
];

// getAndSortOutcomeIdsByContent provides a content sort order for the passed market's outcomeIds. The idea here is to eg. always show [Biden, Sanders, Warren, Bloomberg] in that order. We could instead model this as an actual comparator that could be passed to JavaScript's sort functions.
// TODO this isn't quite done yet... what we want to do is something more like dynamically generating a color scheme to associate each candidate with their personal color. For example most colors are stable now, but if Warren is missing from a market then Bloomberg will take her color --> ACTUALLY this is easy because each series item can specify its own color as seriesItem.color... so we're all set here --> we can even generate a palette of the form `palette: { seriesName: color }`
function getAndSortOutcomeIdsByContent(m: Market): string[] {
  const outcomeIds = Object.keys(m.outcomesById);
  const addedAlready: { [outcomeId: string]: true } = {};
  const sorted: string[] = [];

  // O(contentOrder * outcomes)
  contentOrder.forEach(c => {
    const outcomeIdForThisContent = outcomeIds.find(id => m.outcomesById[id].name.indexOf(c) > -1);
    if (outcomeIdForThisContent !== undefined && !(outcomeIdForThisContent in addedAlready)) {
      addedAlready[outcomeIdForThisContent] = true;
      sorted.push(outcomeIdForThisContent);
    }
  });
  outcomeIds.forEach(id => {
    if (!(id in addedAlready)) {
      sorted.push(id);
    }
  });
  if (sorted.length !== outcomeIds.length) {
    throw new Error(`expected sorted.length=${sorted.length} to equal outcomeIds.length=${outcomeIds.length}`);
  }
  return sorted;
}

// useChart is a hook to encapsulate our use of Rickshaw. Right now the useEffect will instantiate a Chart.domNode and requires the client to mount this domNode while this function has an interval that checks if the domNode has been mounted. TODO another, faster, simpler, less brittle approach might be to create the dom node here, and not use refs, and create the rickshaw graph on an unmounted dom node, and then return the whole thing fully constructed.
function useChart(ms: Markets, chartOptions: ChartOptions): Chart | undefined {
  const {
    desiredSecondsOfHistory,
    hideLegend,
    hideLastTradePriceGraph,
    colorBlindMode,
  } = chartOptions;
  const timeIntervalMillis: number = (() => { // milliseconds, lower is better, but lower affects render performance and graphs will drift from real time. Render performance because of how long each render takes, but also the total number of data points on the graph
    if (desiredSecondsOfHistory < 121) {
      return 1000;
    }
    return 10000;
  })();

  const colorScheme = colorBlindMode === undefined ? defaultColorScheme : colorBlindColorScheme;

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

    const colorWheel = getColorWheel(colorScheme);
    const domNode = (
      <a href={marketIds.length > 0 ? ms.marketsById[marketIds[0]].url : ""} target="_blank">
        <div className="rickshawChartContainer">
          <div className="rickshawChart" ref={chartRef} />
          <div className="rickshawChart2" ref={chart2Ref} />
          {!hideLegend && <div className="rickshawChartLegend">
            {marketIds.map(id => <LegendItem key={id} market={ms.marketsById[id]} colorWheel={colorWheel} />)}
          </div>}
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
    const unprocessedUpdatesByOutcomeId: { [outcomeId: string]: ContractUpdate[] } = {};
    const seriesNameByOutcomeId: { [outcomeId: string]: { [bidOrAsk in 'bid' | 'ask']: string } } = {};
    const series: SeriesInit[] = marketIds.reduce<SeriesInit[]>((sis, marketId) => {
      const m = ms.marketsById[marketId];
      getAndSortOutcomeIdsByContent(m).forEach(outcomeId => {
        // Each Outcome will result in two series, a bid series and an ask series. For example a market (DemNom = Biden x Sanders) will have four series, Biden-bid, Biden-ask, Sanders-bid, Sanders-ask.
        const outcome = m.outcomesById[outcomeId];
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
        unprocessedUpdatesByOutcomeId[outcomeId] = [outcome.initialPrices];
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
        scheme: colorScheme,
      }, {
          timeInterval: timeIntervalMillis,
          maxDataPoints,
          timeBase: Date.now() / 1000,
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
      const simultaneousTicks = 2; // number of ticks that should show simultaneously on the chart
      const tickPeriod = Math.floor(desiredSecondsOfHistory / simultaneousTicks);
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

    // addAllDataPointsUpTilNow does time+data+timestamp calculations and adds exactly
    // the right number of data points into the graph to account for the passage of
    // time. The start of time is baked into the graph. The current time is passed as
    // nowMillisSinceEpoch. addAllDataPointsUpTilNow must be called immediately prior
    // to rerendering the graph, otherwise what's rendered won't actually be up to
    // date. Data points must not be added to the graph by sources other than this
    // function.
    function addAllDataPointsUpTilNow(nowMillisSinceEpoch: number) {
      const secondsSinceEpoch = nowMillisSinceEpoch / 1000;
      const timebaseSecondsSinceEpoch: number = graph.series.timeBase;
      const secondsElapsedSinceChartHistoryBegan = secondsSinceEpoch - timebaseSecondsSinceEpoch;
      const timeIntervalSeconds = timeIntervalMillis / 1000;

      // Regarding expected/actualNumberOfDataPointsEverAddedToChart, the rickshaw FixedDuration series will automatically generate one data point per time step. These data points are initialized to y value of zero. It's possible to initialize them to a default, but we don't yet have historical data, so it's better to show them as a zero. This is why actualNumberOfDataPointsEverAddedToChart will show a large number for a newly initialized chart.
      const expectedNumberOfDataPointsEverAddedToChart = Math.floor(secondsElapsedSinceChartHistoryBegan / timeIntervalSeconds) + 1; // + 1 because the first data point occurs at time zero
      const actualNumberOfDataPointsEverAddedToChart = graph.series.currentIndex;
      const missingNumberOfDataPoints = expectedNumberOfDataPointsEverAddedToChart - actualNumberOfDataPointsEverAddedToChart;
      const dataPointsToAdd = Math.max(missingNumberOfDataPoints, 0);

      // console.log("catchUpPassageOfTime", "timeIntervalSeconds", timeIntervalSeconds, "secondsSinceEpoch", secondsSinceEpoch, "timebaseSecondsSinceEpoch", timebaseSecondsSinceEpoch, "secondsElapsedSinceChartHistoryBegan", secondsElapsedSinceChartHistoryBegan, "expectedNumberOfDataPointsEverAddedToChart", expectedNumberOfDataPointsEverAddedToChart, "actualNumberOfDataPointsEverAddedToChart (currentIndex)", actualNumberOfDataPointsEverAddedToChart, "dataPointsToAdd", dataPointsToAdd);

      if (dataPointsToAdd < 1) {
        // Rarely we have no data points to add if this callback was triggered twice in one timeIntervalSeconds.
        // console.warn("no data points to add");
        return;
      }

      // startSecondsSinceEpochInclusive the first timestamp for which data is missing. We know we have `dataPointsToAdd > 0`, so our start time is just one timeInveral step past the last timestamp that has data. The first data point in the graph is at x=timebaseSecondsSinceEpoch, so with one point ever added to the graph the _next_ time slot available would be timebaseSecondsSinceEpoch + 1, hence we get this formula
      const startSecondsSinceEpochInclusive = timebaseSecondsSinceEpoch + timeIntervalSeconds * actualNumberOfDataPointsEverAddedToChart;
      // console.log("startSecondsSinceEpochInclusive", startSecondsSinceEpochInclusive);

      const dataToAdd: { [outcomeId: string]: ContractUpdate[] } = {};
      Object.keys(unprocessedUpdatesByOutcomeId).forEach(outcomeId => {
        const us = unprocessedUpdatesByOutcomeId[outcomeId];
        if (us.length < 1) {
          // unprocessedUpdatesByOutcomeId[outcomeId] should always be non-empty because it's initialized to `[initialDataPoint]` and then never fully cleared
          throw new Error(`expected unprocessedUpdatesByOutcomeId[outcomeId = ${outcomeId}].length > 0`);
        }
        let i = 0;
        const usLenMinus1 = us.length - 1;
        let stepSecondsSinceEpoch = startSecondsSinceEpochInclusive;
        const dataThisOutcome = [];
        for (let j = 0; j < dataPointsToAdd; j++) {
          /*
            Design note

            unprocessedUpdatesByOutcomeId[outcomeId] are pushed in the order they arrive from the data feed, which is approximately timestamp order.

            us[0] is the least recent data point (besides those already inside the graph). It was the most recent data point the last time we added data points to the graph. Any data points beyond us[0] have arrived since the last time we added points to the graph, ie. been pushed eagerly by an observer subscription from the data feed.

            Our task is to select a data point from `us` for timestamp `stepSecondsSinceEpoch``. We'll select the newest such data point that's older than stepSecondsSinceEpoch. This is simply the most recent data point if consider stepSecondsSinceEpoch to be "time now".
          */

          while (
            i < usLenMinus1 && // if i is the last index, use us[i] (and use us[i] next loop iteration)
            !(us[i].timestamp <= stepSecondsSinceEpoch && us[i + 1].timestamp > stepSecondsSinceEpoch) // if us[i] is the newest that's older than stepSecondsSinceEpoch, use us[i]
          ) {
            // console.log("skipping us[i] timestamp", us[i].timestamp, "stepSecondsSinceEpoch", stepSecondsSinceEpoch);
            i++;
          }
          // console.log("using us[i].timestamp", us[i].timestamp, "stepSecondsSinceEpoch", stepSecondsSinceEpoch);
          dataThisOutcome.push(us[i]);
          stepSecondsSinceEpoch += timeIntervalSeconds;
        }
        unprocessedUpdatesByOutcomeId[outcomeId] = [us[us.length - 1]]; // WARNING note what's happening here, we set unprocessedUpdatesByOutcomeId[outcomeId] to be a new array comprised of only the last element of `us`, this causes us to drop all the data points that weren't already included, except for the most recent data point. The intuition here is that the next time step will already ignore these dropped data points, because us[us.length-1] will be the "newest data point older than stepSecondsSinceEpoch", unless new data points are pushed from the feed
        // if (usLenMinus1 > 0) console.log("added data, outcomeId", outcomeId, "oldLen", usLenMinus1 + 1, "newLen", unprocessedUpdatesByOutcomeId[outcomeId].length);
        dataToAdd[outcomeId] = dataThisOutcome;
        if (dataThisOutcome.length !== dataPointsToAdd) throw new Error(`expected dataThisOutcome.length=${dataThisOutcome.length} === dataPointsToAdd=${dataPointsToAdd}`);
      });

      // Here we actually add the data to the graph. Note that we must add data for all series for one timestep to the graph in one function call, that's how rickshaw is designed. Ie. `dataPointsToAdd` are the number of time steps worth of data that we're adding to the graph.
      for (let j = 0; j < dataPointsToAdd; j++) {
        const data = {};
        Object.keys(dataToAdd).forEach(outcomeId => {
          data[seriesNameByOutcomeId[outcomeId].bid] = dataToAdd[outcomeId][j].bestBidPrice;
          data[seriesNameByOutcomeId[outcomeId].ask] = dataToAdd[outcomeId][j].bestAskPrice;
        });
        graph.series.addData(data);
      }
    }

    function render() {
      // TODO skip render if browser tab is not visible, or if chart div is not visible on screen (due to scrolling, etc)
      graph.render();
      if (graph2 !== undefined) {
        (graph2 as any).render();
      }
    }

    // Using setInterval accumulates O(# of times rendered) drift with respect to real passage of time. This technique reduces the drift to a constant amount. https://stackoverflow.com/questions/29971898/how-to-create-an-accurate-timer-in-javascript
    const initialRenderDelayMillis: number = chartOptions.initialRenderDelayMillis || 25; // We want to render asap, but by (default) delay a tiny bit to allow React to finish its initial render and whatever callbacks may be associated
    let expectedRenderTimeMillisSinceEpoch = Date.now() + initialRenderDelayMillis;
    let graphRenderInterval = window.setTimeout(function step() {
      const millisSinceEpoch = Date.now();
      const deltaMillis = millisSinceEpoch - expectedRenderTimeMillisSinceEpoch;
      expectedRenderTimeMillisSinceEpoch += timeIntervalMillis; // advance expectedRenderTime by the duration of one render cycle, ie. timeIntervalMillis
      const nextInterval = Math.max(0, timeIntervalMillis - deltaMillis);
      addAllDataPointsUpTilNow(millisSinceEpoch);
      render();
      graphRenderInterval = window.setTimeout(step, nextInterval);
    }, initialRenderDelayMillis);

    const updatePrices = (outcomeId: string, cu: ContractUpdate) => {
      // TODO the chart hung when I opened my laptop after it had been closed for 6 hours... and then it caught up just fine. But, the hang is not acceptable, I think it's from the buffered firebase data. We should prevent arbitrarily large amounts of data from being pushed into updatePrices, but it's not as simple as constraining its length to maxDataPoints, because the timestamps of the buffered data matter
      unprocessedUpdatesByOutcomeId[outcomeId].push(cu);
      // console.log("updatePrices", cu, "buffered contractUpdates", unprocessedUpdatesByOutcomeId[outcomeId].length);
      if (graph2 !== undefined) {
        (graph2 as any).series[graph2SeriesIndexByOutcomeId[outcomeId]].data = [{ x: 36, y: cu.lastTradePrice }];
      }
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
      const colorWheel2 = getColorWheel(colorScheme);
      const s = [{
        // this first series is a hack to set the X axis domain from [0,11] which causes the subsequent series' x values of 6 to be in the middle of the X axis domain, which has the effect of rendering the last trade price dot on the right margin of the price chart
        name: "dummy",
        color: "#ffffff",
        data: [{ x: 0, y: -5 }, { x: 71, y: -5 }],
      }];
      let i = 1; // starts at 1 because the dummy series is 0
      marketIds.forEach((marketId) => {
        getAndSortOutcomeIdsByContent(ms.marketsById[marketId]).forEach(outcomeId => {
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

    // TypeScript doesn't support `undefined | defined`, so here we use `undefined | object`, but the `object` type doesn't know about any of the APIs on a graph, so we invoke all apis like `(graph2 as any).api()`.
    const graph2: undefined | object = hideLastTradePriceGraph !== undefined ? undefined : new Rickshaw.Graph(Object.assign({
      element: chart2Div,
      renderer: 'scatterplot',
      min: 0, // y-axis min value, ie. $0
      max: 1, // y-axis max value, $1
      series: graph2Series,
    }, getChart2ElementWidthAndHeight()));

    // Cache nowUTCString once per second, otherwise hoverDetail2.xFormatter will recompute it each render.
    let nowUTCString = new Date().toUTCString();
    const nowUTCInterval = window.setInterval(() => nowUTCString = new Date().toUTCString(), 1000); // this interval will drift, ie. it won't actually fire 60 times per minute, but that doesn't matter because the `new Date` is the correct time "now" whenever "now" happens to be

    if (graph2 !== undefined) {
      const hoverDetail2 = new Rickshaw.Graph.HoverDetail({
        graph: graph2,
        xFormatter: (_x: any) => nowUTCString,
        yFormatter: (y: number) => `${Math.round(y * 100)}¢`,
      });
      // Override formatter https://github.com/shutterstock/rickshaw/blob/master/src/js/Rickshaw.Graph.HoverDetail.js#L34
      hoverDetail2.formatter = (series2: any, _x: any, _y: any, _formattedX: any, formattedY: any, _d: any) => `${series2.name} &nbsp;${formattedY}`;
    }

    const onResize = () => {
      graph.configure(getChartElementWidthAndHeight());
      graph.render();

      if (graph2 !== undefined) {
        const wh = getChart2ElementWidthAndHeight();
        (graph2 as any).configure(getChart2ElementWidthAndHeight());
        (graph2 as any).renderer.dotSize = Math.min(7, Math.max(4, Math.round(wh.height * 0.04)));
        (graph2 as any).render();
      }
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
