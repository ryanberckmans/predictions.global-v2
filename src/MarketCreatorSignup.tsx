import * as React from 'react';
import { Link } from 'react-router-dom';

const marketCreatorBetaSignupFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSdMslhaJfvTLK5MDkQWxyWmwkL28lpNdxznnZuDuJqr65UOZg/viewform?usp=sf_link";

const MarketCreatorSignup: React.SFC<{}> = (_) => {
  return <Link to={"/dashboard"}>
    <div className="market-creator-signup content">
      <strong>📈PredictIt Dashboard (new)</strong>
    </div>
  </Link>;
}

export default MarketCreatorSignup;
