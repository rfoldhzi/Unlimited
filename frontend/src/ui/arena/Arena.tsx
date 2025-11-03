import React, { useContext, useEffect, useState } from 'react';
// @ts-ignore
import Image from "../../image/image.js"
import { useCardLookUp } from "../../context/cardLookUp.tsx";
import "./Arena.css"
import type { CardActive, CardUID, CardStats } from '../../models/game.ts';
import { PlayerName } from '../hand/Hand2.tsx';
import Card from '../card/Card.tsx';

interface Props {
  onSend?: any
  lastMessage?: string
}

export default function Arena({ onSend, lastMessage }: Props) {
                          
  useEffect(() => {
    
  });

  const { data, setValue } = useCardLookUp();

  const [cardSelected, selectCard ] = useState(null as CardActive | null);

  let friendCardSelected = (card: CardActive) => {
    selectCard(card)
  }

  let enemyCardSelected = (card: CardActive) => {
    if (cardSelected) {
      console.log(cardSelected, "atttacks", card)
      console.log(`Attack Card:${PlayerName}:${cardSelected.cardID}:${card.cardID}`)
      onSend(`Attack Card:${PlayerName}:${cardSelected.cardID}:${card.cardID}`)
      selectCard(null)
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
            }).map((playerName: string) => {
              return (
                <div key={playerName} className='flex-center'>
                  {
                    game.players[playerName].groundArena.map((x: CardActive, i: number) => {
                      return (<div className='b'>
                        <Card card={x} clickFunction={() => {enemyCardSelected(x)}}></Card>
                      </div>)
                    })
                  }
                </div>
              )
            })
          }
          <div className='flex-center'>
            {game.players[PlayerName].groundArena.map((x: CardActive, i: number) => {
              return (<div className={'b '+ (cardSelected?.cardID == x.cardID ? 'selected': '')}>
                <Card card={x} clickFunction={() => {friendCardSelected(x)}}></Card>
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
                        <Card card={x} clickFunction={() => {enemyCardSelected(x)}}></Card>
                      </div>)
                    })
                  }
                </div>
              )
            })
          }
          <div className='flex-center'>
            {game.players[PlayerName].spaceArena.map((x: CardActive, i: number) => {
              return (<div className={'b '+ (cardSelected?.cardID == x.cardID ? 'selected': '')}>
                <Card card={x} clickFunction={() => {friendCardSelected(x)}}></Card>
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