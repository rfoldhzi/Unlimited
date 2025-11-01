import React, { useContext, useEffect } from 'react';
// @ts-ignore
import Image from "../../image/image.js"
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Arena.css"
import type { CardActive, CardUID, CardStats } from '../../models/game.ts';
import { PlayerName } from '../hand/Hand2.tsx';

interface Props {
    onSend?: any
    lastMessage?: string
}

export default function Arena({ onSend, lastMessage }: Props) {
                          
  useEffect(() => {
    
  });

  const { data, setValue } = useCardLookUp();



  if (lastMessage && lastMessage.charAt(0) == "{") {
    let groundArena: CardStats[] = []
    let spaceArena: CardStats[] = []
    let game = JSON.parse(lastMessage)
    console.log("game2", game)
    game.players[PlayerName].groundArena.forEach((element: CardActive) => {
      if (data[element.cardUid]) {
        if (data[element.cardUid]?.imgURL) {
          groundArena.push(data[element.cardUid]!)
        }
      } else {
        setValue(element.cardUid)
      }
    });
    game.players[PlayerName].spaceArena.forEach((element: CardActive) => {
      if (data[element.cardUid]) {
        if (data[element.cardUid]?.imgURL) {
          spaceArena.push(data[element.cardUid]!)
        }
      } else {
        setValue(element.cardUid)
      }
    });
    return (
    <div>
    <div className="arena-container ground-arena">
      {groundArena.map((x: CardStats, i: number) => {
        return (<div className='b'>
        <img onClick={() => onSend('Play Card:0:'+x.cardUid)}
          src={x.imgURL}
          alt="card" 
          className="a"

        ></img>
        </div>)
      })}
    </div>
    <div className="arena-container space-arena">
      {spaceArena.map((x: CardStats, i: number) => {
        return (<div className='b'>
        <img onClick={() => onSend('Play Card:0:'+x.cardUid)}
          src={x.imgURL}
          alt="card" 
          className="a"

        ></img>
        </div>)
      })}
    </div>
    </div>
    
  );
  }

  console.log("last Message", lastMessage)

  return (
    <div className="arena-container">

    </div>
  );
}