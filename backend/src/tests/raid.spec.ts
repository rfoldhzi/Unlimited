// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as RaidGame from "./sampleGames/raidTest.json"
import { CardActive, Game } from "../models/game";

describe('Raid Tester', () => {

    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(RaidGame)));
    }

    let gameClass: GameClass;
    beforeEach(() => {
        let a = RaidGame as Game;
        gameClass = new GameClass(a);
        console.log("gameClass",gameClass)
    })

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })

    it("should kill off attacking tie figher", async () => {
        let gameClass = getGame()
        await gameClass.attackCard("0", 1, 2) // [TIE Fighter] attack [Bomber]
        expect(gameClass.players["0"]?.spaceArena.length).toEqual(0);
    })

    it("should let raid attack kill tie fighter", async () => {
        let gameClass = getGame()
        expect(gameClass.players["0"]?.spaceArena.length).toEqual(1);
        gameClass.claimInitiative("0") // Move to player 1 turn
        await gameClass.attackCard("1", 2, 1) // "Surface Assault Bombmer" attack [Tie Fighter]
        expect(gameClass.players["0"]?.spaceArena.length).toEqual(0);
    })

    it("should restore power of Tie-Bomber after attacking unit", async () => {
        let gameClass = getGame()
        gameClass.claimInitiative("0") // Move to player 1 turn
        await gameClass.attackCard("1", 2, 1) // "Surface Assault Bombmer" attack [Tie Fighter]
        let tieBomber = gameClass.players["1"]?.spaceArena.find((card: CardActive) => card.cardID == 2)
        expect(tieBomber).toBeTruthy()
        expect(tieBomber?.power).toBe(1)
    })

    it("should deal bonus damage to bases from raid", async () => {
        let gameClass = getGame()
        expect(gameClass.players["0"]?.base.damage).toEqual(0);
        gameClass.claimInitiative("0") // Move to player 1 turn
        await gameClass.attackBase("1", 2, "0") // "Surface Assault Bombmer" attack [Tie Fighter]
        expect(gameClass.players["0"]?.base.damage).toEqual(2);
    })

    it("should restore power of Tie-Bomber after attacking base", async () => {
        let gameClass = getGame()
        gameClass.claimInitiative("0") // Move to player 1 turn
        await gameClass.attackBase("1", 2, "0") // "Surface Assault Bombmer" attack [Tie Fighter]
        let tieBomber = gameClass.players["1"]?.spaceArena.find((card: CardActive) => card.cardID == 2)
        expect(tieBomber).toBeTruthy()
        expect(tieBomber?.power).toBe(1)
    })
})