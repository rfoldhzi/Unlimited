import React, { useContext, useEffect } from 'react';
// @ts-ignore
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Target.scss"
import { PlayerName } from '../hand/Hand2.tsx';
import { Phase, type CardActive, type Game, type PlayerID } from '../../models/game.ts';
import Card, { CardArea } from '../card/Card.tsx';
import { useSelectedCard } from '../../context/selectedCard.tsx';

interface Props {
  onSend?: any
  lastMessage?: string,
}

export default function Target({ onSend, lastMessage }: Props) {

  useEffect(() => {

  });
  const { selected, targetCollection } = useSelectedCard();
  const { targets, toggleTarget, setTarget, clearTargets } = targetCollection;

  let confrim = () => {
    let cardIDs = targets.map((c: CardActive) => c.cardID)
    console.log("Target:" + PlayerName + ":" + cardIDs.join(","))
    onSend("Target:" + PlayerName + ":" + cardIDs.join(","))
    clearTargets()
  }



  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage) as Game
    if (game.targetInfo.active && game.targetInfo.player == PlayerName) {
      return (
        <div className='target-container'>
          <div className='targeter-card'>
            <div className='targeter-card-2' >
            <Card 
              clickFunction={() => {}} 
              card={game.targetInfo.cardUid}  
              cardArea={CardArea.HAND}
            ></Card>
            </div>
          </div>
          <div className='target-help-text'>
            {game.targetInfo.text}
            <br></br>
            <button className="confirm-targets" onClick={confrim}>Confirm</button>
          </div>
        </div> 
      )
    }
  }

  return (
    <div></div> 
  )
}