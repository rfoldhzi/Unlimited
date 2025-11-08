import React, { useContext, useEffect, useState } from 'react';
// @ts-ignore
import Image from "../../image/image.js"
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Arena.css"
import type { CardActive, CardUID, CardStats } from '../../models/game.ts';
import { PlayerName } from '../hand/Hand2.tsx';
import Card from '../card/Card.tsx';
import { useSelectedCard } from '../../context/selectedCard.tsx';
import FlipMove from 'react-flip-move';

interface Props {
  onSend?: any
  lastMessage?: string
}

export default function Arena({ onSend, lastMessage }: Props) {
                          
  useEffect(() => {
    
  });

  const { selectedCard, setCard } = useSelectedCard();

  // const [selectedCard, selectCard ] = useState(null as CardActive | null);

  let friendselectedCard = (card: CardActive) => {
    setCard(card)
  }

  let abc = (card: CardActive) => {
    // return <FlipMove></FlipMove>
  }

  let enemyselectedCard = (card: CardActive) => {
    if (selectedCard) {
      console.log(selectedCard, "atttacks", card)
      console.log(`Attack Card:${PlayerName}:${selectedCard.cardID}:${card.cardID}`)
      onSend(`Attack Card:${PlayerName}:${selectedCard.cardID}:${card.cardID}`)
      setCard(undefined)
    }
  }


  if (lastMessage && lastMessage.charAt(0) == "{") {
    let game = JSON.parse(lastMessage)
    console.log("game2", game)
    return (
      <div>
        <div className="arena-container ground-arena">
          {
            Object.keys(game.players).filter((playerName: string) => {
              return playerName != PlayerName
            }).map((playerName: string, i:number) => {
              return (
                <div key={playerName} className='flex-center'>
                  {
                    game.players[playerName].groundArena.map((x: CardActive, j: number) => {
                      return (<div className='b'>
                        <Card key={x.cardID+"activeCard"+playerName+j} card={x} clickFunction={() => {enemyselectedCard(x)}}></Card>
                      </div>)
                    })
                  }
                </div>
              )
            })
          }
          <div className='flex-center'>
            {game.players[PlayerName].groundArena.map((x: CardActive, i: number) => {
              return (<div className={'b '+ (selectedCard?.cardID == x.cardID ? 'selected': '')}>
                <Card key={x.cardID+"activeCard"} card={x} clickFunction={() => {friendselectedCard(x)}}></Card>
              </div>)
            })}
          </div>
        </div>
        <div className="arena-container space-arena">
          {
            Object.keys(game.players).filter((playerName: string) => {
              return playerName != PlayerName
            }).map((playerName: string) => {
              return (
                <div key={playerName} className='flex-center'>
                  {
                    game.players[playerName].spaceArena.map((x: CardActive, i: number) => {
                      return (<div className='b'>
                        <Card key={x.cardID+"activeCard"} card={x} clickFunction={() => {enemyselectedCard(x)}}></Card>
                      </div>)
                    })
                  }
                </div>
              )
            })
          }
          <div className='flex-center'>
            {game.players[PlayerName].spaceArena.map((x: CardActive, i: number) => {
              return (<div className={'b '+ (selectedCard?.cardID == x.cardID ? 'selected': '')}>
                <Card key={x.cardID+"activeCard"} card={x} clickFunction={() => {friendselectedCard(x)}}></Card>
              </div>)
            })}
          </div>
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