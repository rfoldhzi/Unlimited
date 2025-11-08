import React, { useContext, useEffect } from 'react';
// @ts-ignore
import Image from "../../image/image.js"
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Hand.css"
import { type CardActive, type CardUID, type CardStats, Phase } from '../../models/game.ts';
import Card, { CardArea } from '../card/Card.tsx';
import { PlayerName } from './Hand2.tsx';
import type { Game } from '../../models/game.ts';

interface Props {
    onSend?: any
    lastMessage?: string
}

export default function Hand({ onSend, lastMessage }: Props) {
                          
  useEffect(() => {
    
  });

  const { data, setValue } = useCardLookUp();

  

  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage) as Game
    let player = game.players[PlayerName]!

    let cardSelected = (card: CardUID) => {
      if (game.phase == Phase.ACTION) {
        onSend(`Play Card:${PlayerName}:${card}`)
      } else {
        if (player.cardsToResource > 0) {
          onSend(`Resource Card:${PlayerName}:${card}`)
        }
      }
    } 

    return (
      <div className="hand-container">
      {player.hand.map((x: CardUID, i: number) => {
          return (<div className='b'>
          <Card 
            clickFunction={() => cardSelected(x)} 
            card={x}  
            cardArea={CardArea.HAND}       
            resources={player.resourcesRemaining}   
          ></Card>
          </div>)
        })}
      </div>
    )
  }

  console.log("last Message", lastMessage)

  return (
    <div className="hand-container">
      {[...Array(6)].map((x, i) => {
        return (<div className='b'>
        <Image onClick={() => onSend('Hi Parent!')}
          fileName="SWH_01_128_Death_Star_Stormtrooper_5bf4e0a2bc.webp"
          alt="card" 
          className="a"

        ></Image>
        </div>)
      })}
    </div>
  );
}