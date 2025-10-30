import React, { useState, useCallback, useEffect } from 'react';
// import { useWebSocket, ReadyState } from 'react-use-websocket';
import Hand from "./Hand.tsx"
import Arena from "../arena/Arena.tsx"
// import * as ws from 'react-use-websocket';
// console.log(ws);
// import { useWebSocket, ReadyState } from "react-use-websocket";
import { ReadyState } from "react-use-websocket";

import useWebSocket from "react-use-websocket"

const useWs = (useWebSocket as any).default as typeof useWebSocket



// console.log(ws);
// export default function Home() {
//     return ""
// }

export default function Home() {
  //Public API that will echo messages sent to it back to the client
//   const [socketUrl, setSocketUrl] = useState('wss://echo.websocket.org');
  const [socketUrl, setSocketUrl] = useState('ws://localhost:9000');
  const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage));
    }
  }, [lastMessage]);

  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl('ws://localhost:1000'),
    []
  );

  const handleClickSendMessage = useCallback((data) => sendMessage(data), []);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div>
      <Hand onSend={handleClickSendMessage} lastMessage={lastMessage?.data}></Hand>
      <Arena onSend={handleClickSendMessage} lastMessage={lastMessage?.data}></Arena>
      <button onClick={handleClickChangeSocketUrl}>
        Click Me to change Socket Url
      </button>
      <button
        onClick={() => handleClickSendMessage("import deck")}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'import deck'
      </button>
      <button
        onClick={() => handleClickSendMessage("Draw Card:0")}
        disabled={readyState !== ReadyState.OPEN}
      >
        Draw Card
      </button>
      <button
        onClick={() => handleClickSendMessage("restart")}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'restart'
      </button>
      <button
        onClick={() => handleClickSendMessage("GAME")}
        disabled={readyState !== ReadyState.OPEN}
      >
        Click Me to send 'GAME'
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {/* {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
      <ul>
        {messageHistory.map((message, idx) => (
          <span key={idx}>{message ? message.data : null}</span>
        ))}
      </ul> */}
    </div>
  );
};