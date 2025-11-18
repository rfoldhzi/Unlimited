import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CardActive, CardStats, CardUID } from "../models/game.ts";
import axios from 'axios';


interface SelectedCardContextType {
  selected: {
    selectedCard: CardActive | undefined;
    setCard: (card: CardActive | undefined) => void;
  },
  targetCollection: {
    targets: CardActive[];
    toggleTarget: (card: CardActive) => void;
    setTarget: (card: CardActive) => void;
    clearTargets: () => void;
  }
}

const SelectedCardContext = createContext<SelectedCardContextType | undefined>(undefined);

export const SelectedCardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCard, setCard] = useState<CardActive | undefined>(undefined);
  const [targets, setTargets] = useState<CardActive[]>([]);

  const toggleTarget = (card: CardActive) => {
    console.log("target", card)
    let t = [...targets]
    if (t.find((item: CardActive) => card.cardID == item.cardID)) {
      const index = t.indexOf(t.find((item: CardActive) => card.cardID == item.cardID)!);
      t.splice(index, 1)
    } else {
      t.push(card)
    }
    console.log("TARGETWS", targets)
    setTargets(t)
  };

  const setTarget = (card: CardActive) => {
    setTargets([card])
  };

  const clearTargets = () => {
    setTargets([])
  };

  const setValue = (card: CardActive | undefined) => {
    setCard(card)
  };

  return (
    <SelectedCardContext.Provider value={{
        selected: { selectedCard, setCard },
        targetCollection: {targets, toggleTarget, setTarget, clearTargets}
      }}>
      {children}
    </SelectedCardContext.Provider>
  );
};

export const useSelectedCard = () => {
  const context = useContext(SelectedCardContext);
  if (!context) throw new Error("useSelectedCard must be used inside a SelectedCardProvider");
  return context;
};
