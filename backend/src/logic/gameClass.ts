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

    public async drawCard(playerId: PlayerID) {
        let player = this.players[playerId]!
        let cardUid = player.deck.pop() as CardUID // Draw from the end of the list
        player.hand.push(cardUid)
    }

    public async playCard(cardUid: CardUID, playerId: PlayerID) {
        console.log("playCard1")
        let card = await createCard(cardUid)
        if (card == null) {
            return
        }
        console.log("playCard2")
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