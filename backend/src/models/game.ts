import { CardKeyword, Upgrade } from "../logic/abilities";

export enum Aspect {
    VIGILANCE = "Vigilance",
    COMMAND = "Command",
    AGGRESSION = "Aggression",
    CUNNING = "Cunning",
    HEROISM = "Heroism",
    VILLANY = "Villany",
}
export enum Arena {
    GROUND,
    SPACE,
}

export enum Phase {
    ACTION,
    REGROUP,
    SETUP,
    GAME_OVER,
}

export enum SubPhase {
    TURN,
    TARGET,
}


export type CardUID = string; // DB version of id
export type CardID = number;
export type PlayerID = string;

export interface CardBasic {
    cardID: CardID,
    cardUid: CardUID, // DB version of id
}

export interface Base {
    cardUid: CardUID,
    aspect: Aspect,
    hp: number,
    damage: number,
}

export interface Leader {
    cardUid: CardUID,
    aspects: Aspect[],
    ready: boolean,
    epicActionAvailable: boolean,
    deployed: boolean,
}

export interface CardResource extends CardBasic {
    ownerID: PlayerID,
}

export interface CardStats extends CardBasic {
    name: string,
    hp: number,
    power: number,
    cost: number,
    aspectCost: Aspect[],
    imgURL?: string,
    arena?: Arena,
    keywords: CardKeyword[]
}

export interface CardActive extends CardStats {
    // Changing things
    damage: number,
    ready: boolean,
    ownerID: PlayerID,
    controllerID: PlayerID,
    upgrades: Upgrade[],
}

export interface PlayerState {
    playerID: PlayerID,
    base: Base,
    leaders: Leader[],
    hand: CardUID[],
    deck: CardUID[],
    discard: CardUID[],
    resources: CardResource[],
    totalResources: number,
    resourcesRemaining: number,
    groundArena: CardActive[],
    spaceArena: CardActive[],
    finished: boolean;
    cardsToResource: number,
}

export interface Game {
    gameID: number;
    players: {[playerID: string] : PlayerState;}
    name: string;
    turn: PlayerID;
    initiative: PlayerID | null;
    initiativeClaimed: boolean;
    phase: Phase;
    subPhase: SubPhase;
    targets: any[];
    targetCount?: {
        min: Number,
        max: Number,
    }
    cardCount: number,
    winner?: PlayerID,
    playedCard?: CardActive | undefined;
}

export let games: Game[] = [];