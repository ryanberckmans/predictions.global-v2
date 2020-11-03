import firebase from "firebase/app";
import "firebase/database"; // WARNING on a JavaScript error like "firebase.database not a function", this is because subsets of the firebase.app.App API may be undefined unless their firebase services are imported like this line
import { makeObserverOwner, Observer, ObserverOwner } from "./Components/observer";
import { PIMarkets } from "./PIData"; // TODO load this dynamically, but also send it from serverside
import { Market, Markets, Outcome, OutcomePrices } from "./RealTimePriceChart";

// !! TODO JavaScript objects can't have number keys, they are auto converted to strings, so I can discard all the toString stuff everywhere and most warnings.

// TODO move ContractUpdate to RealTimePriceChart and call it OutcomeUpdate
export interface ContractUpdate extends OutcomePrices {
  contractId: string; // PI's data feed models marketId/contractId as a number, but we do so as a string, so that our ids are compatible with Object.keys
  timestamp: number;
}

interface PIDataFeed {
  getContractObserver: (contractId: string) => Observer<ContractUpdate>,
}

const piDataFeedsByName: { [name: string]: PIDataFeed } = {};

function getOrInitPIDataFeed(): PIDataFeed {
  const name = "pi-data-feed-singleton"; // Firebase supports instantiation of multiple clients, each with a unique name. Right now we just have a singleton client
  if (piDataFeedsByName.hasOwnProperty(name)) {
    return piDataFeedsByName[name];
  }

  const config = {
    apiKey: "AIzaSyDXdDCHMMqgwx2RS1ORhZHeczBgAHyJ3oA",
    authDomain: "predictit-f497e.firebaseapp.com",
    databaseURL: "https://predictit-f497e.firebaseio.com",
    projectId: "predictit-f497e",
    messagingSenderId: "76708845910",// messagingSenderId uniquely identifies each client that writes to Firebase, but I believe it's hardcoded as the same for all PI users https://firebase.google.com/docs/cloud-messaging/concept-options#credentials
  };

  const fb = firebase.initializeApp(config, name);

  // addMarketListener(firebaseInstances[instanceName]); // TODO right now we don't need any marketStats data, we just need contract prices. The most useful thing from marketStats feed might be TotalSharesTraded, which we could add soon.

  const allContractIds: string[] = [];
  for (const m of PIMarkets.markets) { // TODO pass PIMarkets
    for (const c of m.contracts) {
      allContractIds.push(c.id.toString()); // WARNING contractIds must be strings in our data structures, even though PI models them as numbers
    }
  }
  const getContractObserver = addContractListener(allContractIds, fb);

  piDataFeedsByName[name] = {
    getContractObserver,
  };

  return piDataFeedsByName[name];
}

// addContractListener adds a constractStats listener to the passed
// firebase instance and returns an API to get an observer per
// contract. Right now we require that all potential contractIds are
// passed as an argument because we create ObserverOwners eagerly
// and don't dynamically detect or build the set of contractIds.
function addContractListener(allContractIds: string[], fb: firebase.app.App): (contractId: string) => Observer<ContractUpdate> {
  const observerOwnersByContractId: { [contractId: string]: ObserverOwner<ContractUpdate> } = {};
  const initialTimestampSecondsSinceEpoch: number = Date.now() / 1000;
  allContractIds.forEach(id => {
    const initialContractUpdate: ContractUpdate = {
      contractId: id,
      timestamp: initialTimestampSecondsSinceEpoch,
      // TODO set these initial prices to real values. Right now it doesn't matter because RealTimePriceChart gets initial values from its Outcome.initialPrices, not Outcome.observer.initialValue.
      bestBidPrice: 0,
      bestAskPrice: 1,
      lastTradePrice: 0,
    };
    observerOwnersByContractId[id] = makeObserverOwner(initialContractUpdate);
  });

  const query = fb.database()
    .ref("contractStats")
    .orderByChild('TimeStamp')
    .startAt((+new Date() / 1000).toFixed(5));
  let sanity = false;
  // TODO how do we catch and log errors from Firebase?
  query.once('value', () => {
    if (sanity) throw new Error("expected query.once callback to trigger at most once");
    sanity = true;
    query.on('child_added', update);
    query.on('child_changed', update);
    function update(data: firebase.database.DataSnapshot) {
      const timestampRaw = parseFloat(data.child("TimeStamp").val());
      const bestNoPriceVal = data.child("BestNoPrice").val();
      const u: ContractUpdate = {
        contractId: data.child("ContractId").val().toString(), // WARNING PI models ContractId as a number, but we do so as a string so that our ids are compatible with Object.keys
        timestamp: isNaN(timestampRaw) ? (Date.now() / 1000) : timestampRaw,
        bestBidPrice: bestNoPriceVal ? 1 - bestNoPriceVal : 0, // ie. in PredictIt nomenclature, BestNoPrice is the price you'd pay to buy a "No", ie. to sell a yes / fill a pre-existing yes/buy order. So if BestNoPrice is 0.3, then you'd provide $0.30 to match the pre-existing yes/buy order, and the order creator provided $0.70, which is why the bestBidPrice is `1 - BestNoPrice`
        bestAskPrice: data.child("BestYesPrice").val() || 1, // ie. in PredictIt nomenclature, BestYesPrice is the price you (the order filler/taker) pay to buy a yes share, ie. to fill a pre-existing no/sell order, this is just the best ask price. For example if there was a best ask of 0.6, and you filled this order, you'll expect to pay $0.60 to fill that order, and order creator matches that with $0.40 to create $1 of open interest (assuming neither side pays for the trade with pre-owned shares)
        lastTradePrice: data.child("LastTradePrice").val() || 0,
      };
      // console.log("ContractUpdate", u);
      if (u.contractId in observerOwnersByContractId) {
        observerOwnersByContractId[u.contractId].setValueAndNotifyObservers(u);
      } else {
        // console.warn(`ignoring ContractUpdate for unknown contractId ${u.contractId} which wasn't in allContractIds`);
      }

      // This code shows how to dump the JSON subtree at data.child:
      // const props = Object.keys(CONTRACT_DATA_MAP).reduce<any>((o, k) => {
      //   o[k] = data.child(k).val();
      //   return o;
      // }, {});
      // console.log(props, data.exportVal());
    }
  });

  const getContractObserver = (contractId: string) => observerOwnersByContractId[contractId].observer;
  return getContractObserver;
}

// TODO update addMarketListener to match new observer structure of addContractListener
// function addMarketListener(fb: firebase.app.App) {
//   const query = fb.database()
//     .ref("marketStats")
//     .orderByChild('TimeStamp')
//     .startAt((+new Date() / 1000).toFixed(5).toString());
//   let sanity = false;
//   query.once('value', () => {
//     if (sanity) throw new Error("expected query.once callback to trigger at most once");
//     sanity = true;
//     query.on('child_added', update);
//     query.on('child_changed', update);
//     function update(data: firebase.database.DataSnapshot) {
//       const props = Object.keys(MARKET_DATA_MAP).reduce<any>((o, k) => {
//         o[k] = data.child(k).val();
//         return o;
//       }, {});
//       console.log(props, data.exportVal());
//     }
//   });
// }

const demRegexp = new RegExp(/^Democratic$/);
const repRegexp = new RegExp(/^Republican$/);

function outcomeNameFixup(outcomeName: string): string {
  return outcomeName
    .replace("160 mil. or more", "160M+")
    .replace("157 mil - 160 mil", "157-160M")
    .replace("154 mil - 157 mil", "154-157M")
    .replace("151 mil - 154 mil", "151-154M")
    .replace("6.0% to 6.5%", "6.0-6.5%")
    .replace("6.5% to 7.0%", "6.5-7.0%")
    .replace("7.0% to 7.5%", "7.0-7.5%")
    .replace("7.5% to 8.0%", "7.5-8.0%")
    .replace("8.0% to 8.5%", "8.0-8.5%")
    .replace("% - ", "-")
    .replace("% -", "-")
    .replace("% to ", "-")
    .replace("% +", "%+") // extraneous space in PI data
    .replace(" under ", " <") // ie. " under 3%"
    .replace(demRegexp, "D")
    .replace(repRegexp, "R")
    .replace(" House, ", "-H ")
    .replace(" Senate", "-Sen")
    .replace("Dems by", "D")
    .replace("GOP by", "R")
    .replace("Dems +", "D +")
    .replace("GOP +", "R +")
    .replace(" or more", "+") // ie. "+4 or more" -> "+4+"
    .replace("Florida", "FL")
    .replace("Wisconsin", "WI")
    .replace("North Carolina", "NC")
    .replace("Ohio", "OH")
    .replace("November", "Nov")
    .replace("After December 14", "Dec 14+")
    .replace("December", "Dec")
  ;
}

const stateWinnerRegexp = new RegExp(/^Which party will win ([a-zA-Z]+) in 2020/);

function marketNameFixup(marketName: string): string {
  return marketName
    .replace("Trump win popular vote in 2020", "Trump wins popular vote")
    .replace("November", "Nov")
    .replace("House seats won by Democrats in 2020", "Dem House seats won")
    .replace("margin of victory", "MOV")
    .replace("Turnout in the presidential election", "Voter turnout")
    .replace(stateWinnerRegexp, (match, state) => state)
    .replace("Which party wins the presidency in 2020", "Which party wins the presidency")
    .replace("2020 presidential election winner", "Next president")
    .replace("Will Trump be the 2020 GOP nominee", "Trump GOP nominee")
    .replace("Will Pence be 2020 GOP VP nominee", "Pence GOP VP nominee")
    .replace("Will 2020 Dem VP nominee be a woman", "Dem VP nominee a woman")
    .replace("Balance of power after 2020 election", "Balance of power after 2020")
    .replace("after 2020", "")
    .replace("State with smallest MOV in 2020", "State with smallest MOV")
    .replace("jurisdiction in 2020", "")
    .replace("in 2020", "")
    .replace("2020 ", "")
    .replace("Which party will win ", "")
    .replace(" Dem primary winner", "")
    .replace(" Democratic caucus winner", "")
    .replace(" Democratic primary winner", "")
    .replace(" Dem caucus winner", "")
    .replace("Democrats Abroad primary winner", "Dems abroad")
    .replace("Democratic nominee", "Dem nominee")
    .replace("presidential winner", "President")
    .replace("Democratic VP nominee", "Dem VP nominee")
    .replace("Brokered Democratic convention", "Brokered convention")
    .replace("Will Hillary Clinton run in 2020", "Hillary Clinton runs")
    .replace("Who will control the House after 2020", "Controls House after 2020")
    .replace("Who will control the Senate after 2020", "Controls Senate after 2020")
    .replace("Number of Democrats", "# of Dems")
    .replace("California primary margin of victory", "CA margin of victory")
    .replace("Washington primary margin of victory", "WA margin of victory")
    .replace("presidential vote margin", "vote margin")
    .replace("presidential election call", "election call")
    .replace("'Tipping point'", "Tipping point")
    .replace("?", "")
  ;
}

let singletonMarkets: undefined | Markets; // TODO stop using a singletonMarkets and have better control over precisely when it's constructed, and how many times it is constructed

// Construct a RealTimePriceChart Markets for the available PI data. Only
// one of these should be constructed for use in N RealTimePriceCharts.
export function getMarkets(): Markets {
  if (singletonMarkets !== undefined) return singletonMarkets;
  const piDataFeed = getOrInitPIDataFeed();
  const secondsSinceEpoch = Date.now() / 1000;
  const piMarketsById: { [marketId: string]: any } = PIMarkets.markets.reduce<{ [marketId: string]: any }>((o, m) => {
    o[m.id] = m;
    return o;
  }, {});

  const marketsById: { [marketId: string]: Market } = Object.keys(piMarketsById).reduce<{ [marketId: string]: Market }>((o, id) => {
    const m = piMarketsById[id];
    const m2: Market = {
      name: marketNameFixup(m.shortName),
      imageUrl: m.image,
      url: m.url,
      outcomesById: getOutcomes(id),
    };
    o[id] = m2;
    return o;
  }, {});

  function getOutcomes(marketId: string): { [outcomeId: string]: Outcome } {
    const outcomesById: { [outcomeId: string]: Outcome } = (piMarketsById[marketId].contracts as any[]).reduce<{ [outcomeId: string]: Outcome }>((o, c) => {
      o[c.id] = {
        name: piMarketsById[marketId].contracts.length > 1 ? outcomeNameFixup(c.shortName) : "Yes", // if this market has only one contract, then we name the outcome "Yes" because downstream we want to display "${marketName} ${outcomeName}" and for binary markets the best way to display this is "Will Trump 1st term recession? Yes"
        imageUrl: c.image,
        initialPrices: {
          contractId: c.id.toString(), // PIData JSON has `c.id: number` but we need string
          timestamp: secondsSinceEpoch,
          bestBidPrice: c.bestSellYesCost || 0, // ie. in PI nomenclature, bestSellYesCost is my revenue to sell 1 yes share, ie. the money the counterparty provides for my yes share, which is the best bid
          bestAskPrice: c.bestBuyYesCost || 1, // ie. in PI nomenclature, bestBuyYesCost is my cost to buy 1 yes share, ie. the money required to fill a pre-existing sell order, which is the best ask
          lastTradePrice: c.lastTradePrice || 0,
        },
        observer: piDataFeed.getContractObserver(c.id.toString()),
      };
      return o;
    }, {});
    return outcomesById;
  }

  const markets = {
    marketsById,
  };
  singletonMarkets = markets;
  return singletonMarkets;
}

// fetchMarkets uses the PredictIt JSON API to construct a Markets. But, this won't
// work because the PI JSON API lacks the response header Access-Control-Allow-Origin.
async function fetchMarkets(): Promise<any> {
  // fetch polyfill provided by create-react-app
  try {
    const resp = await fetch(new Request("https://www.predictit.org/api/marketdata/all/", {
      mode: "cors", // mode cors assumes dataURI has a different origin; once dataURI is served from CDN (instead of directly from google storage bucket) we'll want to update this code.
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }));
    console.log(resp.json());
    if (!resp.ok) {
      console.log("resp not ok", resp);
      throw Error(resp.statusText);
    }
    return resp.json();
  } catch (e) {
    console.error(e);
    throw e;
  }
}
