import React, { useContext, useEffect, useState } from 'react';
// @ts-ignore
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Base.css"
import { PlayerName } from '../hand/Hand2.tsx';
import { Phase, type Game, type PlayerID } from '../../models/game.ts';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useSelectedCard } from '../../context/selectedCard.tsx';

interface Props {
  onSend?: any,
  lastMessage?: string,
  playerID: PlayerID,
}

export default function Base({ playerID, onSend, lastMessage, }: Props) {

  let [isOpen, setIsOpen] = useState(false)
  const { data, setValue } = useCardLookUp();

  const { selectedCard, setCard } = useSelectedCard();
  let baseClicked = () => {
    if (selectedCard && playerID != PlayerName) { // make sure attacker selected and this is not your base
      setCard(undefined)
      onSend(`Attack Base:${PlayerName}:${selectedCard.cardID}:${playerID}`)
    }
  }

  
  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage) as Game
    let player = game.players[playerID]!
    let url: string = ""
    let uid = player.base.cardUid
    let aspectColor: string = ""
    let health = player.base.hp - player.base.damage

    if (data[uid]) {
      if (data[uid]?.imgURL) {
        url = data[uid]?.imgURL!
      }
      if (data[uid]?.aspectCost) {
        aspectColor = data[uid]?.aspectCost[0] || "" as any
      }
    } else {
      if (uid) {
        setValue(uid)
      }
      return (<div></div>)
    }

    return (
      <div className="base-container">
        <div className='base'>
          <p className="health-text">
              {health}
          </p>
          <img onClick={(event: any) => {
            console.log("event", event)
            // clickFunction()
            setIsOpen(true)
          }}
            onContextMenu={(event: any) => {
              // event.preventDefault()
              // setIsOpen(true)
              console.log("event2", event)
              return false
            }}
            src={url}
            alt="card"
            className={"base-card"}
          ></img>
          <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <DialogPanel className={"max-w-lg space-y-4 border bg-white p-12 card-modal card-color-" + aspectColor}>
                {/* <DialogTitle className="font-bold">Deactivate account</DialogTitle>
                                <Description>This will permanently deactivate your account</Description> */}
                {/* <p>Are you sure you want to deactivate your account? All of your data will be permanently removed.</p> */}
                <img
                  src={url}
                  alt="card"
                  className="preview-card"
                ></img>
                <div className="flex gap-4 text-white ">
                  <button onClick={() => setIsOpen(false)}>Cancel</button>
                  <button onClick={() => { setIsOpen(false); baseClicked()}}>Use</button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        </div>
      </div>
    );
  }
  return null;

}