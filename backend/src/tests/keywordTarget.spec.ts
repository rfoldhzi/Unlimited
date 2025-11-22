// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as game from "./sampleGames/keywordTarget.json"
import { Aspect, CardActive, CardType, Game } from "../models/game";
import * as GameHandler from "../logic/gameHandler"
import { Keyword } from "../logic/abilities";

describe('Explot Ambush Target Test', () => {

    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(game)));
    }

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })



    it("should play the baktoid spider droid and ambush", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        // // console.log()
        mock.mockImplementation(async (cardUid: string) => {
            console.log("something", cardUid)
            let card: CardActive = {
                arena: 0,
                aspectCost: [Aspect.COMMAND],
                cardUid: "5243634234",
                controllerID: "0",
                cost: 8,
                damage: 0,
                hp: 8,
                imgURL: "",
                keywords: [
                    {
                        keyword: Keyword.AMBUSH,
                        number: 0
                    }
                ],
                name: "BAKTOID SPIDER DROID",
                ownerID: "0",
                power: 8,
                ready: false,
                buffs: [],
                cardID: 0,
                upgrades: [],
                traits: [],
                cardType: CardType.UNIT
            }
            return card
        })

        let gameClass = getGame()
        await gameClass.playCard('5243634234', "0")
        await gameClass.setTargets(["2"])
        expect(gameClass.players["1"]?.groundArena.length).toBe(0) // The loth-wolf should die
    })

    it("should play the baktoid spider droid and exploit for lower cost", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        // // console.log()
        mock.mockImplementation(async (cardUid: string) => {
            console.log("something", cardUid)
            let card: CardActive = {
                arena: 0,
                aspectCost: [Aspect.COMMAND],
                cardUid: "5243634234",
                controllerID: "0",
                cost: 8,
                damage: 0,
                hp: 8,
                imgURL: "",
                keywords: [
                    {
                        keyword: Keyword.EXPLOIT,
                        number: 2
                    }
                ],
                name: "BAKTOID SPIDER DROID",
                ownerID: "0",
                power: 8,
                ready: false,
                buffs: [],
                cardID: 0,
                upgrades: [],
                traits: [],
                cardType: CardType.UNIT
            }
            return card
        })

        let gameClass = getGame()
        await gameClass.playCard('5243634234', "0")
        await gameClass.setTargets(["1"])
        expect(gameClass.players["0"]?.resourcesRemaining).toBe(2) // Reduced cost of droid
        expect(gameClass.players["0"]?.groundArena.length).toBe(1) // Killed off other unit
    })
})