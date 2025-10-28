import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CardStats } from "../models/game.ts";
import axios from 'axios';

type CardLookUpMap = Record<number, CardStats>; // or whatever your key/value types are

interface CardLookUpContextType {
  data: CardLookUpMap;
  setValue: (key: number) => void;
}

async function fetchCard(cardUid: number) {
  let result = await new Promise((resolve, reject) => {
    axios.get(`https://admin.starwarsunlimited.com/api/card/${cardUid}`).then((res: any) => {
      resolve({
        statusCode: res.statusCode,
        data: res.data
      });
      // let output = '';
      // res.setEncoding('utf8');

      // res.on('data', function (chunk: any) {
      //     output += chunk;
      // });

      // res.on('end', () => {
      //     try {
      //         let obj = JSON.parse(output);
      //         // console.log('rest::', obj);
      //         resolve({
      //             statusCode: res.statusCode,
      //             data: obj
      //         });
      //     }
      //     catch (err) {
      //         console.error('rest::end', err);
      //         // reject(err);
      //     }
      // });
    })

  })
  return result

}

async function createCard(cardUid: number): Promise<CardStats> {
  let data: any = await fetchCard(cardUid)
  data = data.data.data
  console.log("data", data)
  let card: CardStats = {
    cardID: 0,
    cardUid: cardUid,
    name: data.attributes.title,
    hp: data.attributes.hp,
    power: data.attributes.pwoer,
    cost: data.attributes.cost,
    aspectCost: [],
    imgURL: data.attributes.artFront.data.attributes.formats.card.url
  }
  return card
}

const CardLookUpContext = createContext<CardLookUpContextType | undefined>(undefined);

export const CardLookUpProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CardLookUpMap>({});

  const setValue = (key: number) => {
    createCard(key).then((result: CardStats) =>
      setData(prev => ({ ...prev, [key]: result }))
    );
  };

  return (
    <CardLookUpContext.Provider value={{ data, setValue }}>
      {children}
    </CardLookUpContext.Provider>
  );
};

export const useCardLookUp = () => {
  const context = useContext(CardLookUpContext);
  if (!context) throw new Error("useCardLookUp must be used inside a CardLookUpProvider");
  return context;
};
