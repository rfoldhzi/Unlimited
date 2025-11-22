// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as GameState from "./sampleGames/applyUpgrade.json"
import * as GameHandler from "../logic/gameHandler"
import { Aspect, CardActive, CardType, CardUpgrade, Game } from "../models/game";

describe('Play Upgrade and interact with abilities', () => {
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

    it("should play Revan's Lightsaber", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        // // console.log()
        mock.mockImplementation(async (cardUid: string) => {
            let card: CardUpgrade = {
                aspectCost: [Aspect.VILLANY],
                cardUid: "9566815036",
                controllerID: "0",
                cost: 2,
                imgURL: "",
                keywords: [],
                name: "Darth Revan's Lightsabers",
                ownerID: "0",
                cardID: 0,
                hp: 0,
                power: 0,
                traits: [],
                cardType: CardType.UPGRADE,
                upgradePower: 2,
                upgradeHp: 2,
                parentCardID: -1
            }
            return card
        })
        let gameClass = getGame()
        await gameClass.playCard("9566815036", "1")
        await gameClass.setTargets(["4"])
        expect(gameClass.data.turn).toBe("0")
        console.log("gameClass.players[]?.groundArena",gameClass.players["1"]?.groundArena)
        let mando = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 4)
        expect(mando).toBeTruthy()
        expect(mando?.upgrades.length).toBe(1)
        expect(mando?.buffs.length).toBe(1)
        expect(mando?.hp).toBe(5) // Combine his ability with new upgrade
        expect(mando?.power).toBe(5) // Combine his ability with new upgrade
    })
})