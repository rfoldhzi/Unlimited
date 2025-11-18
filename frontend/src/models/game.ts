import type { Buff, CardKeyword } from "./abilities.ts";

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
    buffs: Buff[],
    upgrades: UpgradeActive[],
}

export interface UpgradeActive extends CardStats {
    parentCardID: CardID,
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

export enum TargetType {
    UNIT = "UNIT",
    BASE = "BASE",
    HAND = "HAND",
    /**
     * Pick from string option list
     * 
     * Must set target info options list for player to choose from
     */
    OPTIONS = "OPTIONS"
}   

export enum TargetCount {
    ONE = "ONE",
    ANY = "ANY",
}

export interface TargetInfo {
    active: boolean,
    player: PlayerID,
    count: TargetCount,
    type: TargetType,
    options: string[],
    targets: string[],
    cardUid: CardUID,
    text: string,
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
    cardCount: number,
    winner?: PlayerID,
    playedCard?: CardActive | undefined;
    heap: any[];
    stack: (any)[];
    targetInfo: TargetInfo,
}

export let games: Game[] = [];