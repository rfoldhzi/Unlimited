// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as GameState from "./sampleGames/defeat.json"
import { Aspect, CardActive, Game } from "../models/game";

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

    it("should allow attack on sentinel", async () => {
        let gameClass = getGame()
        expect(gameClass.players["0"]?.base.damage).toBe(10) // Starting base damage
        await gameClass.attackCard("1", 2, 1) // "Dark Trooper" attack "Dhani Pilgrim"
        expect(gameClass.data.turn).toBe("0") // Should move to next turn
        expect(gameClass.players["0"]?.base.damage).toBe(9) // Should heal the base 1
    })
})