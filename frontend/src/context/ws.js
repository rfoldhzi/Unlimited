
import React, { useState, useRef, useEffect, useCallback } from 'react';
export const WebsocketContext = React.createContext([false, null, () => {}])
//                                            ready, value, send

// Make sure to put WebsocketProvider higher up in
// the component tree than any consumer.
export const WebsocketProvider = ({ children }) => {
  const [isReady, setIsReady] = useState(false)
  const [val, setVal] = useState(null)

  const ws = useRef(null)

  console.log("loading...")

  useEffect(() => {
    console.log("loading2...")
    const socket = new WebSocket("wss://echo.websocket.org")

    socket.onopen = () => {
      console.log("ready")
      setIsReady(true)
    }
    socket.onclose = () => {
      console.log("closed")
      setIsReady(false)
    }
    socket.onmessage = (event) => {
      console.log("mses", event)
      setVal(event.data)
    }

    ws.current = socket

    return () => {
      console.log("closing?")
      socket.close()
    }
  }, [])

  const ret = [isReady, val, ws.current?.send.bind(ws.current)]

  return (
    <WebsocketContext.Provider value={ret}>
      {children}
    </WebsocketContext.Provider>
  );
}

export default WebsocketProvider;