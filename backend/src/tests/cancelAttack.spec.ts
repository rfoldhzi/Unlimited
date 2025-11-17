// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as SentinelGame from "./sampleGames/cancelAttackTest.json"
import { Aspect, CardActive, Game } from "../models/game";
import * as GameHandler from "../logic/gameHandler"
import { Keyword } from "../logic/abilities";

describe('Cancel Attack Test', () => {
    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(SentinelGame)));
    }

    let gameClass: GameClass;
    beforeEach(() => {
        let a = SentinelGame as Game;
        gameClass = new GameClass(a);
    })

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })

    it("should allow attack on sentinel", async () => {
        let gameClass = getGame()
        // gameClass.claimInitiative("0") // Move to player 1 turn
        // expect(gameClass.data.turn).toBe("1")
        gameClass.data.turn = "1"
        await gameClass.attackCard("1", 6, 5) // "Hoth Trooper" attack "Loth-Wolf"
        let lothWolf = gameClass.players["0"]?.groundArena.find((card: CardActive) => card.cardID == 5)
        expect(lothWolf?.damage).toBe(2) // Loth-wolf should take 2 damage
        expect(gameClass.data.turn).toBe("0") // Next Turn
    })

    it("should cancel the attack because of sentinel", async () => {
        let gameClass = getGame()
        gameClass.data.turn = "1"
        await gameClass.attackCard("1", 6, 7) // "Hoth Trooper" attack "Dhani Pilgrim"
        expect(gameClass.data.turn).toBe("1") // Should be same turn since attack was canceled
    })

    it("should cancel the base attack because of sentinel", async () => {
        let gameClass = getGame()
        gameClass.data.turn = "1"
        await gameClass.attackBase("1", 6, "0") // "Hoth Trooper" attack base
        expect(gameClass.data.turn).toBe("1") // Should be same turn since attack was canceled
    })

    it("should apply Hidden to Vupltex and cancel the attack against it", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        mock.mockImplementation(async (cardUid: string) => {
            let card: CardActive = {
                arena: 0,
                aspectCost: [Aspect.HEROISM],
                cardUid: "7742118411",
                controllerID: "",
                cost: 2,
                damage: 0,
                hp: 2,
                imgURL: "https://cdn.starwarsunlimited.com//card_05010245_EN_Vulptex_4c37969f34.png",
                keywords: [{ keyword: Keyword.HIDDEN, number: 0 }],
                name: "Vulptex",
                ownerID: "1",
                power: 3,
                ready: false,
                buffs: [],
                cardID: 0,
                upgrades: []
            }
            return card
        })
        
        let gameClass = getGame()
        gameClass.data.turn = "1"
        await gameClass.playCard('7742118411', "1")
        expect(gameClass.data.turn).toBe("0") // Should move to next turn after playing card
        await gameClass.attackCard("0", 7, 10) // "Dhani Pilgrim" attack "Vupltex"
        expect(gameClass.data.turn).toBe("0") // Should cancel attack because vulptex is hidden
        let vulp = gameClass.players["1"]?.groundArena.find((card: CardActive) => card.cardID == 10)
        console.log("vulp uograde", vulp?.buffs)
        expect(vulp?.damage).toBe(0) // Vulp should take no damage as attack is canceled
    })
})