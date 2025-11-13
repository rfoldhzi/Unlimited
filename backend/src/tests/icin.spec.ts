// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as GameState from "./sampleGames/incin.json"
import { Aspect, CardActive, Game } from "../models/game";

describe('Incinerator Trooper Test', () => {
    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(GameState)));
    }

    let gameClass: GameClass;
    beforeEach(() => {
        let a = GameState as Game;
        gameClass = new GameClass(a);
    })

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })

    it("Incinerator Trooper take damage on non-kill", async () => {
        let gameClass = getGame()
        await gameClass.attackCard("1", 2, 1) // "Incinerator Trooper" attack "Dhani Pilgrim"
        let trooper = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 2)
        expect(trooper).toBeTruthy(); 
        expect(trooper?.damage).toBe(1) // Trooper should take damage
    })

    it("Incinerator Trooper take no damage on kill", async () => {
        let gameClass = getGame()
        let pilgrim = gameClass.players["0"]?.groundArena.find((card: CardActive) => card.cardID == 1)
        expect(pilgrim).toBeTruthy(); 
        pilgrim!.damage = 1
        await gameClass.attackCard("1", 2, 1) // "Incinerator Trooper" attack "Dhani Pilgrim"
        let trooper = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 2)
        expect(trooper).toBeTruthy(); 
        expect(trooper?.damage).toBe(0) // Trooper should no damage because of his ability
    })

    it("Should trigger Pilgrim's base heal on defeat from Incin", async () => {
        let gameClass = getGame()
        let pilgrim = gameClass.players["0"]?.groundArena.find((card: CardActive) => card.cardID == 1)
        expect(pilgrim).toBeTruthy(); 
        pilgrim!.damage = 1
        gameClass.players["0"]!.base.damage = 1
        await gameClass.attackCard("1", 2, 1) // "Incinerator Trooper" attack "Dhani Pilgrim"
        let trooper = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 2)
        expect(trooper).toBeTruthy(); 
        expect(gameClass.players["0"]?.base.damage).toBe(0) // Should heal the base 1
    })

    it("Should kill Incin Trooper when defender deals damage", async () => {
        //Checking that damage in ability can trigger defeat
        let gameClass = getGame()
        let trooper = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 2)
        expect(trooper).toBeTruthy(); 
        trooper!.damage = 1
        await gameClass.attackCard("1", 2, 1) // "Incinerator Trooper" attack "Dhani Pilgrim"
        let trooper2 = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 2)
        expect(trooper2).toBeFalsy(); //Should kill incin trooper
    })
})