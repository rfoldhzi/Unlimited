// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as ATDPGame from "./sampleGames/costCalcTest.json"
import { Aspect, CardActive, Game } from "../models/game";
import * as GameHandler from "../logic/gameHandler"

describe('Cost Calculation Test', () => {

    let card = {
        data: {
            data: {
                attributes: {
                    arenas: {
                        data: [
                            {
                                attributes: {
                                    name: "Ground"
                                }
                            }
                        ]
                    },
                    aspects: {
                        data: [

                        ]
                    },
                    artFront: {
                        data: {
                            attributes: {
                                formats: {
                                    card: {

                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let getGame = () => {
        return new GameClass(JSON.parse(JSON.stringify(ATDPGame)));
    }

    let gameClass: GameClass;
    beforeEach(() => {
        let a = ATDPGame as Game;
        gameClass = new GameClass(a);
    })

    it("should exist", async () => {
        let gameClass = getGame()
        expect(gameClass).toBeTruthy();
    })



    it("should play the AT-DP Card at reduced cost", async () => {
        const mock = jest.spyOn(GameHandler, "createCard")
        // // console.log()
        mock.mockImplementation(async (cardUid: string) => {
            console.log("something", cardUid)
            let card: CardActive = {
                arena: 0,
                aspectCost: [Aspect.AGGRESSION],
                cardUid: "1087522061",
                controllerID: "1",
                cost: 4,
                damage: 0,
                hp: 4,
                imgURL: "https://cdn.starwarsunlimited.com//card_04010163_EN_AT_DP_Occupier_0592405d18.png",
                keywords: [],
                name: "AT-DP Occupier",
                ownerID: "1",
                power: 3,
                ready: false,
                upgrades: [],
                cardID: 0
            }
            return card
        })

        let gameClass = getGame()
        expect(gameClass.players["1"]?.resourcesRemaining).toEqual(11);
        await gameClass.playCard('1087522061', "1")
        expect(gameClass.players["1"]?.resourcesRemaining).toEqual(9); // Card should cost 2 to play

    })
})