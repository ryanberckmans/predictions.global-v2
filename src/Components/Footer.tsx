import * as React from 'react';
import { Link } from 'react-router-dom';
import { feedbackFormURL } from '../Components/Header';
import MarketCreatorSignup from '../MarketCreatorSignup';

const Footer = <footer className="footer">
  <div className="container">
    <div className="columns is-centered is-vcentered">
      <div className="column is-4">
        <div className="columns has-text-centered is-centered is-vcentered is-multiline content">
          <div className="column is-12 is-paddingless">
            <strong>Links</strong>
          </div>
          <div className="column is-12 is-paddingless">
            <a href="https://catnip.exchange" target="_blank">Catnip, a prediction market exchange built on Augur</a>
          </div>
          <div className="column is-12 is-paddingless">
            <Link to="/how-2020-election-real-time-dashboard-works">The 2020 Election Real-Time Dashboard: How it Works</Link>
          </div>
        </div>
      </div>
      <div className="column is-4 has-text-centered is-centered is-vcentered content">
        {/* TODO use something like Header.doesClickingLogoReloadPage so that clicking Footer logo doesn't always do a hard reload */}
        <a href="/"><img className="logo" src="/logo.png" /></a>
        <p><em>© 2020 Predictions Global</em></p>
      </div>
      <div className="column is-4 has-text-centered is-centered is-vcentered content">
        <div className="columns is-centered is-vcentered is-multiline">
          <div className="column is-12">
            <Link to={"/dashboard"}>
              <strong>Click Here for the 2020 Election Real-Time Dashboard for PredictIt markets</strong>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>;

export default Footer;
