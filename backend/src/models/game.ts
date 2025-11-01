export enum Aspect {
    VIGILANCE,
    COMMAND,
    AGGRESSION,
    CUNNING,
    HEROISM,
    VILLANY,
}
export enum Arena {
    GROUND,
    SPACE,
}

export type CardUID = string;
export type CardID = string;
export type PlayerID = string;

export interface CardBasic {
    cardID: CardID,
    cardUid: CardUID, // DB version of id
}

export interface CardResource extends CardBasic {
    ownerID: PlayerID,
    controllerID: PlayerID,
    ready: boolean,
}

export interface CardStats extends CardBasic {
    name: string,
    hp: number,
    power: number,
    cost: number,
    aspectCost: Aspect[],
    imgURL?: string,
    arena?: Arena,
}

export interface CardActive extends CardStats {
    // Changing things
    damage: number,
    ready: boolean,
    ownerID: PlayerID,
    controllerID: PlayerID,
}

export interface Leader extends CardActive {
    aspects: Aspect[],
}

export interface PlayerState {
    playerID: PlayerID,
    hand: CardUID[],
    deck: CardUID[],
    discard: CardUID[],
    resources: CardResource[],
    leader: Leader[],
    groundArena: CardActive[],
    spaceArena: CardActive[],
}

export interface Game {
    gameID: number;
    players: {[playerID: string] : PlayerState;}
    name: string;
    initiative: PlayerID;
}

export let games: Game[] = [];