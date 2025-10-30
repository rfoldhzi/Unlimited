import React, { useContext, useEffect } from 'react';
// @ts-ignore
import Image from "../../image/image.js"
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Hand.css"
import type { CardActive, CardUID, CardStats } from '../../models/game.js';
import Card from '../card/Card.tsx';

interface Props {
    onSend?: any
    lastMessage?: string
}

export default function Hand({ onSend, lastMessage }: Props) {
                          
  useEffect(() => {
    
  });

  const { data, setValue } = useCardLookUp();



  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage)
    return (
      <div className="hand-container">
      {game.players["0"].hand.map((x: CardUID, i: number) => {
          return (<div className='b'>
          <Card 
            clickFunction={() => onSend('Play Card:0:' + x)} card={x}            
          ></Card>
          </div>)
        })}
      </div>
    )
    // let handList: CardStats[] = []
    // game.players["0"].hand.forEach((element: CardUID) => {
    //   if (data[element]) {
    //     if (data[element]?.imgURL) {
    //       handList.push(data[element])
    //     }
    //   } else {
    //     setValue(element)
    //   }
    // });
    // return (
    // <div className="hand-container">
    //   {handList.map((x: CardStats, i: number) => {
    //     return (<div className='b'>
    //     <img onClick={() => onSend('Play Card:0:'+x.cardUid)}
    //       src={x.imgURL}
    //       alt="card" 
    //       className="a"
          
    //     ></img>
    //     </div>)
    //   })}
    // </div>
    // );
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