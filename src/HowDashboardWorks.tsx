import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
// @ts-ignore for HashLink which has no TypeScript types
import { HashLink } from 'react-router-hash-link';
import Footer from './Components/Footer';
import Header, { feedbackFormURL, HasMarketsSummary } from "./Components/Header";
import { Observer } from "./Components/observer";
import { Currency } from './Currency';

type Props = HasMarketsSummary & {
  currencySelectionObserver: Observer<Currency>;
}

const HowDashboardWorks: React.SFC<Props> = (props) => {
  return <div>
    <Header ms={props.ms} currencySelectionObserver={props.currencySelectionObserver} doesClickingLogoReloadPage={false} headerContent={
      <div className="has-text-centered content">
      </div>
    }
    />
    <section className="section">
      <div className="container">
        <div className="columns is-centered is-vcentered content">
          <div className="column is-12-mobile is-6-tablet is-6-desktop no-padding-bottom no-margin-bottom">
            <h3 className="title">The 2020 Election Real-Time Dashboard: How it Works</h3>
          </div>
        </div>
        <div className="columns is-centered is-vcentered content">
          <div className="column is-12-mobile is-6-tablet is-6-desktop no-padding-bottom no-margin-bottom">
            <ul>
              <li>
                Click <Link to="/dashboard">here</Link> to go to dashboard.<br /><br />
              </li>
              <li>
                <strong>TL;DR</strong> Prediction markets aggregate information, and this dashboard aggregates prediction markets, giving an advance-warning bird's-eye view of how the election is going.<br /><br />
              </li>
              <li>
                All dashboard charts are updated in real-time, as fast as being logged into PredictIt.
              </li>
              <li>
                Try it on your phone, tablet, or desktop!
              </li>
              <li>
                The dashboard shows real-time trading prices and bid-ask spreads for prediction markets for the 2020 election. It's the only place on the internet to see this information in a single view in real-time.
              </li>
              <li>
                Dashboard charts show prices for markets from <a href="https://www.predictit.org/" target="_blank">PredictIt</a>.
              </li>
              <li>
                In the future, this dashboard may show prices from <a href="https://catnip.exchange" target="_blank">Catnip</a>. Catnip is built on Augur.
              </li>
              <li>
                For the prediction markets covered by this dashboard, each outcome share price is always between $0 and $1. For example, the current price of a "Trump YES" share might be $0.38, which you can read as "the market traders think Trump has a 38% chance to win".
              </li>
              <li>
                In each dashboard chart, the different colors correspond to multiple potential outcomes for that market. Usually, these outcomes are mutually exclusive. For example, within the same chart, one color might be "Trump wins", and another color might be "Trump loses". Each outcome has its own share price between $0 and $1 and its own order book with its own bid-ask spread.
              </li>
              <li>
                In each dashboard chart, the big dots on the chart's right edge are the last trade price for that color-coded outcome. If we see a big dot about two-thirds of the way up a chart, our intuition is that the last trade price was about $0.66 because $0.66 is two-thirds between $0 and $1.
              </li>
              <li>
                In each dashboard chart, the two lines of the same color are the trading order book bid &amp; ask price for one outcome. The higher line is the ask price, or price at which traders are currently selling this outcome share. The lower line is the bid price, or price at which traders are currently buying this outcome share. Our intuition is that the vertical space between these lines is proportional to the size of the order book spread for that outcome.
              </li>
              <li>
                Each chart has a two-hour timescale on the left half and a one-minute timescale on the right half. This means each chart's left half moves slowly, and right half moves quickly.
              </li>              
              <li>
                When you load or reload the dashboard, only new data is shown, not historical data. Leave the tab open and the charts will build up two hours of history.
              </li>
              <li>
                You may notice that after the dashboard has been open for about a minute, each chart will show a weird vertical line in the middle. The vertical line is merely the start of the two-hour timescale on the left half of each chart. It will go away naturally once the dashboard has been open for two hours.
              </li>
              <li>
                Mouse over (or tap) the big dots, or anywhere on a chart line, to see the price at that time.
              </li>
              <li>
                In each chart's legend, click on the market name to open a new tab to its PredictIt market.
              </li>
              <li>
                The dashboard is available in a <Link to="/dashboard?colorBlindMode=1">color-blind mode</Link>.
              </li>
              <li>
                The dashboard's history duration can be customized via URL parameter  like ?historySeconds=144. The right half of each chart has that many seconds of history. The left half has 100x that many seconds of history. By default, the right half has 72 seconds of history and the left half 7200 seconds. <Link to="/dashboard?historySeconds=144">Example</Link>. Setting historySeconds too low may result in poor performance.
              </li>     
            </ul>
          </div>
        </div>
      </div>
    </section>
    {Footer}
    <Helmet>
      <title>How the 2020 Election Real-Time Dashboard Works | Predictions.Global</title>
      <meta name="description" content="How the 2020 Election Real-Time Dashboard Works on Predictions.Global." />
    </Helmet>
  </div>;
};

export default HowDashboardWorks;
