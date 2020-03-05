import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './arrayFromPolyfill';
import './index.css';
import { unregisterServiceWorker } from './registerServiceWorker';
import { Routes } from './Routes';

// window.DATA_URI is set index.html from the environment
// variable REACT_APP_DATA_URI. This allows the dataURI to
// vary based on build environment (eg. dev, staging, prod).

unregisterServiceWorker(); // I've decided to stop using service workers because right now we frequently publish data updates and I'm always telling users to "refresh the page twice" which is a bad experience for them

ReactDOM.render(<Routes/>, document.getElementById('root') as HTMLElement);
