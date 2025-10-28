import { Game, PlayerState, CardUID, PlayerID, Arena } from "../models/game";
import { createCard } from "./gameHandler";

export class GameClass implements Game {
    gameID: number;
    players: { [playerID: string]: PlayerState; };
    name: string;
    initiative: string;

    public constructor(data: Game) {
        this.gameID = data.gameID;
        this.players = data.players;
        this.name = data.name;
        this.initiative = data.initiative
    }

    public async playCard(cardUid: CardUID, playerId: PlayerID) {
        let card = await createCard(cardUid)
        card.ready = false;
        card.ownerID = playerId;

        // find card in player's hand
        let player = this.players[playerId]!
        console.log("PLYER", player, player.hand, cardUid)
        let index = player.hand.indexOf(cardUid)
        if (index != -1) {
            player.hand.splice(index,1)
        } else {
            console.log("cannot find card in hand")
            // we cant play the card
            return
        }
        
        // player.groundArena.push(card)
        if (card.arena == Arena.GROUND) {
            player.groundArena.push(card)
        } else if (card.arena == Arena.SPACE) {
            player.spaceArena.push(card)
        }
    }
}