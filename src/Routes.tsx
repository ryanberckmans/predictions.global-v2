import * as React from 'react';
import { Helmet } from "react-helmet";
import Loadable from 'react-loadable';
import { RouteComponentProps } from "react-router";
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Home } from './App';
import { LoadingHTML } from './Components/Loading';
import { makeObserverOwner, ObserverOwner } from './Components/observer';
import ScrollToTop from './Components/ScrollToTop';
import { Currency, getSavedCurrencyPreference, saveCurrencyPreference } from './Currency';
import { Dashboard } from './Dashboard';
import { EmbeddedMarketCard } from './EmbeddedMarketCard';
import FAQ from './FAQ';
import { MarketsSummary } from "./generated/markets_pb";
import HowDashboardWorks from './HowDashboardWorks';
import { MarketDetailPage, marketDetailPageURLPrefix, URLParams } from './MarketDetailPage';
import { makeMarketSortFunctions, MarketSortFunctions } from './MarketSort';
import PublicEthereumNodes from './PublicEthereumNodes';
import { indexRelatedMarkets, RelatedMarketsIndex } from './RelatedMarkets';
import VeilMarketsContext from "./VeilMarketsContext";

const marketsSummaryIntervalDelay = 1000;

async function fetchMarketsSummary(dataURI: string): Promise<MarketsSummary> {
  // fetch polyfill provided by create-react-app
  try {
    const resp = await fetch(new Request(dataURI, {
      mode: "cors", // mode cors assumes dataURI has a different origin; once dataURI is served from CDN (instead of directly from google storage bucket) we'll want to update this code.
    }))

    if (!resp.ok) {
      throw Error(resp.statusText);
    }

    const ab = await resp.arrayBuffer();
    return MarketsSummary.deserializeBinary(new Uint8Array(ab));
  } catch (e) {
    // tslint:disable-next-line
    console.error(e);
    throw e;
  }
}

function periodic<T>(func: () => Promise<T>, callback: (data: T) => void, interval: number = 1000): () => void {
  let periodicFuncTimeout: number | undefined;
  let isCancelled = false;

  const periodicFunc = () => {
    func().then((data) => {
      if (isCancelled) {
        return;
      }

      callback(data);
      periodicFuncTimeout = window.setTimeout(periodicFunc, interval);
    }).catch(console.error);
  };

  periodicFunc();

  return () => {
    isCancelled = true;

    if (periodicFuncTimeout) {
      clearTimeout(periodicFuncTimeout);
    }
  };
}

let marketsSummaryCallback: (m: MarketsSummary) => void;
const cancelFetchMarketsSummary = periodic(fetchMarketsSummary.bind(null, (window as any).DATA_URI), (m: MarketsSummary) => marketsSummaryCallback(m), marketsSummaryIntervalDelay);

interface RoutesState {
  marketSortFunctions?: MarketSortFunctions,
  marketsSummary?: MarketsSummary,
  relatedMarketsIndex?: RelatedMarketsIndex,
  currencySelectionObserverOwner: ObserverOwner<Currency>,
  veilMarkets: Array<[string, string]>
}

export class Routes extends React.Component<any, RoutesState> {
  public readonly state: RoutesState;
  private cancelFetchMarketsSummary?: () => void;

  constructor(props: any) {
    super(props);

    const o = makeObserverOwner(getSavedCurrencyPreference());
    o.observer.subscribe((newCurrency) => saveCurrencyPreference(newCurrency));

    this.cancelFetchMarketsSummary = cancelFetchMarketsSummary;
    marketsSummaryCallback = (marketsSummary: MarketsSummary) => {
      this.setMarketsSummary(marketsSummary);
    }

    this.state = {
      currencySelectionObserverOwner: o,
      marketsSummary: undefined,
      veilMarkets: []
    };
  }

  public componentDidMount() {
    this.fetchVeilMarkets();
  }

  public componentWillUnmount() {
    if (this.cancelFetchMarketsSummary) {
      this.cancelFetchMarketsSummary();
    }
  }

  public render(): JSX.Element {
    // TODO not every route requires the main MarketsSummary to be loaded. Need to refactor data loading so that LoadingHTML is only shown for data required for that specific page.
    const { marketSortFunctions, marketsSummary, relatedMarketsIndex } = this.state;
    if (marketSortFunctions === undefined || marketsSummary === undefined || relatedMarketsIndex === undefined) {
      return <LoadingHTML />;
    }

    const renderHome = (props: object) => (
      <Home currencySelectionObserverOwner={this.state.currencySelectionObserverOwner}
        ms={marketsSummary} marketSortFunctions={marketSortFunctions} {...(props as RouteComponentProps<any>)} />);
    const renderEmbeddedMarketCard = (props: object) => (
      <EmbeddedMarketCard marketsSummary={marketsSummary} {...(props as RouteComponentProps<any>)} />);
    const renderPublicEthereumNodes = () => <PublicEthereumNodes
      ms={marketsSummary}
      currencySelectionObserver={this.state.currencySelectionObserverOwner.observer}
    />;
    const renderFAQ = () => <FAQ
      ms={marketsSummary}
      currencySelectionObserver={this.state.currencySelectionObserverOwner.observer}
    />;
    const renderHowDashboardWorks = () => <HowDashboardWorks
      ms={marketsSummary}
      currencySelectionObserver={this.state.currencySelectionObserverOwner.observer}
    />;
    const renderMarketDetailPage = (props: RouteComponentProps<URLParams>) => <MarketDetailPage
      ms={marketsSummary}
      currencyObserver={this.state.currencySelectionObserverOwner.observer}
      {...props}
      relatedMarketsIndex={relatedMarketsIndex}
    />;

    const AsyncAugurFeeWindow = Loadable({
      loader: () => import('./AugurFeeWindowInfo/AugurFeeWindowInfo'),
      loading() {
        return <LoadingHTML />;
      }
    });
    const renderAugurFeeWindows = () => <AsyncAugurFeeWindow ms={marketsSummary}
      currencySelectionObserverOwner={this.state.currencySelectionObserverOwner}
    />;

    return (
      <Router>
        <div>
          <Helmet>
            <title>Augur Prediction Market Data &amp; Statistics | Predictions.Global</title>
            <meta name="description"
              content="Latest odds on Augur Prediction markets. Tools for Augur traders, market creators, and reporters. Augur prediction market discusion, trading volume, bid ask, and charts." />
          </Helmet>
          <ScrollToTop>
            <VeilMarketsContext.Provider value={this.state.veilMarkets}>
              <Switch>
                <Route exact={true} path="/e/v1/:id" render={renderEmbeddedMarketCard} />
                <Route exact={true} path="/e/:id" render={renderEmbeddedMarketCard} />
                <Route exact={true} path={`${marketDetailPageURLPrefix}/:url`} render={renderMarketDetailPage} />
                <Route exact={true} path="/augur-public-ethereum-nodes" render={renderPublicEthereumNodes} />
                <Route exact={true} path="/augur-reporter-fee-window-rep-profit-calculator" render={renderAugurFeeWindows} />
                <Route exact={true} path="/faq" render={renderFAQ} />
                <Route exact={true} path="/dashboard" component={Dashboard} />
                <Route exact={true} path="/how-2020-election-real-time-dashboard-works" render={renderHowDashboardWorks} />
                <Route exact={true} path="/" render={renderHome} />
              </Switch>
            </VeilMarketsContext.Provider>
          </ScrollToTop>
        </div>
      </Router>
    );
  }

  private setMarketsSummary = (marketsSummary: MarketsSummary) => {
    // Disable automatic reloads
    if (this.cancelFetchMarketsSummary) {
      this.cancelFetchMarketsSummary();
    }

    this.setState({
      marketSortFunctions: makeMarketSortFunctions(marketsSummary),
      marketsSummary,
      relatedMarketsIndex: indexRelatedMarkets(marketsSummary),
    });
  };

  private fetchVeilMarkets = async () => {
    // try {
    //   const resp = await fetch(new Request("https://api.veil.co/api/v1/market_ids", {
    //     mode: "cors", // mode cors assumes dataURI has a different origin; once dataURI is served from CDN (instead of directly from google storage bucket) we'll want to update this code.
    //   }))
    //
    //   if (!resp.ok) {
    //     throw Error(resp.statusText);
    //   }
    //
    //   const json: { data: Array<[string, string]> } = await resp.json();
    //   this.setState({ veilMarkets: json.data });
    // } catch(e) {
    //   throw e;
    // }
  }
}
