// import { beforeEach, describe } from "node:test";
import { GameClass } from "../logic/gameClass";
import * as ATDPGame from "./sampleGames/costCalcTest.json"
import * as GameHandler from "../logic/gameHandler"
import { CardActive, Game } from "../models/game";

describe('Cost Calculation Test', () => {

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
        const mock = jest.spyOn(GameHandler, "fetchCard")
        // Mock fetching basic AT-DP card
        mock.mockImplementation(async (arg: string) => {
            return {
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
        });  // replace implementation
        let gameClass = getGame()
        expect(gameClass.players["1"]?.resourcesRemaining).toEqual(11);
        await gameClass.playCard('1087522061', "1")
        expect(gameClass.players["1"]?.resourcesRemaining).toEqual(9); // Card should cost 2 to play

    })
})