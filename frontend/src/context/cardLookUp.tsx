import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CardStats, CardUID } from "../models/game.ts";
import axios from 'axios';

type CardLookUpMap = Record<CardUID, CardStats>; // or whatever your key/value types are

interface CardLookUpContextType {
  data: CardLookUpMap;
  setValue: (key: CardUID) => void;
}

async function fetchCard(cardUid: CardUID) {
  let result = await new Promise((resolve, reject) => {
    axios.get(`https://admin.starwarsunlimited.com/api/card/${cardUid}`).then((res: any) => {
      resolve({
        statusCode: res.statusCode,
        data: res.data
      });
    }).catch(error => {
      reject();
    });

  })
  return result

}

async function createCard(cardUid: CardUID): Promise<CardStats | null> {
  let data: any = null
  data = await fetchCard(cardUid).catch(error => {
    return null
  });
  if (data == null) {
    return null
  }
  data = data.data.data
  console.log("data", data)
  let card: CardStats = {
    cardID: 0,
    cardUid: cardUid,
    name: data.attributes.title,
    hp: data.attributes.hp,
    power: data.attributes.pwoer,
    cost: data.attributes.cost,
    aspectCost: data.attributes.aspects.data.map((item: any) => item.attributes.name),
    imgURL: data.attributes.artFront.data.attributes.formats.card.url
  }
  return card
}

const CardLookUpContext = createContext<CardLookUpContextType | undefined>(undefined);

export const CardLookUpProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<CardLookUpMap>({});

  const setValue = (key: CardUID) => {
    createCard(key).then((result: CardStats | null) => {
      if (result == null) return
      setData(prev => ({ ...prev, [key]: result }))
    }
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
