import React, { useContext, useEffect } from 'react';
// @ts-ignore
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Info.css"
import { PlayerName } from '../hand/Hand2.tsx';
import { Phase, type Game } from '../../models/game.ts';

interface Props {
  onSend?: any
  lastMessage?: string
}

export default function Info({ onSend, lastMessage }: Props) {

  useEffect(() => {

  });

  let totalResources = 2
  let yourTurn = false
  let remainingResources = 1
  let cardsToResourceDiv = null

  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage) as Game
    let player = game.players[PlayerName]!
    totalResources = player.totalResources
    remainingResources = player.resourcesRemaining
    yourTurn = game.turn == PlayerName && game.phase == Phase.ACTION

    if (player.cardsToResource) {
      cardsToResourceDiv = (<div className="cardsToResource">
        +{player.cardsToResource}
      </div>)
    }

  }

  return (
    <div className="info-container">
      {yourTurn &&
        <button className="action-button"
          onClick={(event: any) => {
            onSend("initiative:" + PlayerName)
          }}>
          Initiative
        </button>
      }
      {yourTurn &&
        <button className="action-button"
          onClick={(event: any) => {
            onSend("pass:" + PlayerName)
          }}>
          Pass
        </button>
      }
      <div className="resources">
        {remainingResources}/{totalResources}
      </div>
      {cardsToResourceDiv}
    </div>
  );
}