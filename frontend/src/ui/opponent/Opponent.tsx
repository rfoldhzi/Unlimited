import React, { useContext, useEffect, useState } from 'react';
// @ts-ignore
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import { PlayerName } from '../hand/Hand2.tsx';
import { Phase, type Game, type PlayerID } from '../../models/game.ts';
import { Description, Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import Info from '../info/Info.tsx';
import Base from '../base/Base.tsx';
import "./Opponent.css"

interface Props {
  onSend?: any,
  lastMessage?: string,
}

export default function Opponent({ onSend, lastMessage, }: Props) {

  useEffect(() => {

  });

  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage) as Game

    return (
      <div className="opponents-container">
        {
          Object.keys(game.players).filter((opName: string) => {
            return opName != PlayerName
          }).map((opName: string) => {
            return (
              <div key={opName} className='opponent-container'>
                <Info playerID={opName} onSend={onSend} lastMessage={lastMessage}></Info>
                <Base playerID={opName} onSend={onSend} lastMessage={lastMessage}></Base>
              </div>
            )
          })
        }
      </div>
    );
  }
  return null;

}