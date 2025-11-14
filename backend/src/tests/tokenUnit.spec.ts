// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as GameState from "./sampleGames/tokenUnit.json"
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

    it("should create tie fighter (token unit) on attack", async () => {
        let gameClass = getGame()
        expect(gameClass.players["0"]?.spaceArena.length).toBe(4) // Starting with 4 units
        await gameClass.attackBase("0", 13, "1") // "Quasar TIE Carrier" attack base
        expect(gameClass.players["0"]?.spaceArena.length).toBe(5) // Create new unit
    })
})