// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as GameState from "./sampleGames/hidden.json"
import { Aspect, CardActive, Game } from "../models/game";
import * as GameHandler from "../logic/gameHandler"
import { Keyword } from "../logic/abilities";

describe('Hidden Test', () => {
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

    it("should not allow attack on hidden trooper", async () => {
        let gameClass = getGame()
        gameClass.data.turn = "1"
        await gameClass.attackCard("1", 2, 30) // "Hoth Trooper" attack "Vupltex"
        let vupltex = gameClass.players["0"]?.groundArena.find((card: CardActive) => card.cardID == 30)
        expect(vupltex).toBeTruthy(); // Make sure vulptex didn't die
        expect(vupltex?.damage).toBe(0) // Vulptex shouldn't take damage
        expect(gameClass.data.turn).toBe("1") // Should stay the same turn
    })
})