import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CardActive, CardStats, CardUID } from "../models/game.ts";
import axios from 'axios';


interface SelectedCardContextType {
  selectedCard: CardActive | undefined;
  setCard: (card: CardActive | undefined) => void;
}

const SelectedCardContext = createContext<SelectedCardContextType | undefined>(undefined);

export const SelectedCardProvider = ({ children }: { children: ReactNode }) => {
  const [selectedCard, setCard] = useState<CardActive | undefined>(undefined);

  const setValue = (card: CardActive | undefined) => {
    setCard(card)
  };

  return (
    <SelectedCardContext.Provider value={{ selectedCard, setCard }}>
      {children}
    </SelectedCardContext.Provider>
  );
};

export const useSelectedCard = () => {
  const context = useContext(SelectedCardContext);
  if (!context) throw new Error("useSelectedCard must be used inside a SelectedCardProvider");
  return context;
};
