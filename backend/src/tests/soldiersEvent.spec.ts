// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as game from "./sampleGames/soldiersEvent.json"
import { Aspect, CardActive, CardEvent, Game } from "../models/game";
import * as GameHandler from "../logic/gameHandler"
import { Keyword } from "../logic/abilities";

describe('Manuafractured Soldiers Event Test', () => {

    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(game)));
    }

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })



    it("should play the event and create 2 clones", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        // // console.log()
        mock.mockImplementation(async (cardUid: string) => {
            let card: CardEvent = {
                aspectCost: [Aspect.COMMAND, Aspect.COMMAND],
                cardUid: "1192349217",
                controllerID: "0",
                cost: 3,
                imgURL: "",
                keywords: [],
                name: "Manufactured Soldiers",
                ownerID: "0",
                cardID: 0,
                hp: 0,
                power: 0
            }
            return card
        })

        let gameClass = getGame()
        await gameClass.playCard('1192349217', "1")
        await gameClass.setTargets(["2 Clones"])
        expect(gameClass.players["1"]?.groundArena.length).toBe(2)
    })
})