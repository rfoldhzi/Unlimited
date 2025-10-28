import logo from './logo.svg';
import './App.css';
import React from 'react';
import ChildComponent from "./ui/hand/Hand.tsx";
import Home from "./ui/hand/Hand2.tsx";
import WebsocketProvider from "./context/ws.js"
import { CardLookUpProvider } from "./context/cardLookUp.tsx"

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit3 <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {/* <WebsocketProvider /> */}
          {/* <ChildComponent /> */}
          <CardLookUpProvider>
            <Home />
          </CardLookUpProvider>
        </header>
      </div>
    );
  }
}
