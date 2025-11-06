import logo from './logo.svg';
import './App.css';
import React from 'react';
import ChildComponent from "./ui/hand/Hand.tsx";
import Home from "./ui/hand/Hand2.tsx";
import WebsocketProvider from "./context/ws.js"
import { CardLookUpProvider } from "./context/cardLookUp.tsx"
import { SelectedCardProvider } from './context/selectedCard.tsx';

export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          {/* <WebsocketProvider /> */}
          {/* <ChildComponent /> */}
          <CardLookUpProvider>
            <SelectedCardProvider>
              <Home />
            </SelectedCardProvider>
          </CardLookUpProvider>
        </header>
      </div>
    );
  }
}
