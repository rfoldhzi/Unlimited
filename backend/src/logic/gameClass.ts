import { Game, PlayerState, CardUID, PlayerID, Arena, CardID, CardActive, Phase, CardResource } from "../models/game";
import { createCard } from "./gameHandler";

export class GameClass implements Game {
    gameID: number;
    players: { [playerID: string]: PlayerState; };
    name: string;
    initiative: PlayerID | null;
    cardCount: number;
    data: Game;
    phase: Phase;
    turn: PlayerID;

    public constructor(data: Game) {
        this.data = data
        this.gameID = data.gameID;
        this.players = data.players;
        this.name = data.name;
        this.initiative = data.initiative
        this.cardCount = data.cardCount
        this.phase = data.phase;
        this.turn = data.turn;
    }

    /**
     * Find in-play unit across all players
     * @param cardID id you are looking for
     * @returns CardActive
     */
    public findUnitAnyPlayer(cardID: CardID): CardActive | undefined {
        let card: CardActive | undefined
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            for (let c of player.groundArena) {
                if (c.cardID == cardID) return c
            }
            for (let c of player.spaceArena) {
                if (c.cardID == cardID) return c
            }
        }
        return card
    }

    /**
     * Find in-play unit owned by player
     * @param cardID id you are looking for
     * @returns CardActive
     */
    private findUnitByPlayer(playerID: PlayerID, cardID: CardID): CardActive | undefined {
        let card: CardActive | undefined
        let player = this.players[playerID]!
        for (let c of player.groundArena) {
            if (c.cardID == cardID) return c
        }
        for (let c of player.spaceArena) {
            if (c.cardID == cardID) return c
        }
        return card
    }

    public async defeatCard(card: CardActive) {
        let player = this.players[card.controllerID]!
        let list: CardActive[]
        if (card.arena == Arena.GROUND) {
            list = player.groundArena
        } else {
            list = player.spaceArena
        }

        let index = list.indexOf(card)
        if (index != -1) {
            list.splice(index,1)
        } else {
            console.log("cannot find card in arena")
            // we cant play the card
            return
        }
    }

    public async attackCard(playerID: PlayerID, attackerID: CardID, defenderID: CardID) {
        let attacker = this.findUnitByPlayer(playerID, attackerID)
        let defender = this.findUnitAnyPlayer(defenderID)
        console.log("attacker",attacker)
        console.log("defender",defender)
        if (!attacker) {
            console.log("Declined Attack: Can't find attacker")
            return
        }
        if (!defender) {
            console.log("Declined Attack: Can't find defender")
            return
        }
        if (attacker.controllerID == defender.controllerID) {
            console.log("Declined Attack: Can't attack card on same team")
            return
        }
        if (!attacker.ready) {
            console.log("Declined Attack: Attacker must be ready")
            return
        }

        attacker.ready = false
        attacker.damage += defender.power
        defender.damage += attacker.power

        if (attacker.damage >= attacker.hp) this.defeatCard(attacker)
        if (defender.damage >= defender.hp) this.defeatCard(defender)
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
        card.ready = true; //TODO change to false
        card.ownerID = playerId;
        card.controllerID = playerId;

        this.data.cardCount += 1;
        card.cardID = this.data.cardCount;

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

    public async regroup() {
        this.data.phase = Phase.REGROUP
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            for (let c of player.groundArena) {
                c.ready = true
            }
            for (let c of player.spaceArena) {
                c.ready = true
            }
            this.drawCard(playerID);
            player.cardsToResource = 1;
        }
    }   


    public async checkStartActionPhase() {
        let allPlayersFinished = true;
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            if (player.cardsToResource > 0) {
                allPlayersFinished = false
            }
        }
        if (allPlayersFinished) {
            this.data.phase = Phase.ACTION;
            this.data.turn = this.data.initiative!
        }
    }

    public async playerFinish(playerId: PlayerID) {
        let player = this.players[playerId]!
        player.finished = true

        let allPlayersFinished = true;
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            if (!player.finished) {
                allPlayersFinished = false
            }
        }
        if (allPlayersFinished) {
            await this.regroup()
        }
    }

    public async claimInitive(playerId: PlayerID) {
        if (this.data.initiative != null) {
            console.log("cannot calim initive: Already claimed")
            return
        }
        this.data.initiative = playerId
        await this.playerFinish(playerId)
    }

    public async resourceCard(cardUid: CardUID, playerId: PlayerID) {
        let player = this.players[playerId]!
        if (player.cardsToResource <= 0) {
            console.log("no resource attempts right now")
            return
        }
        let index = player.hand.indexOf(cardUid)
        if (index != -1) {
            player.hand.splice(index,1)
        } else {
            console.log("cannot find card in hand")
            // we cant play the card
            return
        }

        this.data.cardCount += 1;
        let cardResource: CardResource = {
            ownerID: playerId,
            cardID: this.data.cardCount,
            cardUid: cardUid
        }
        player.resources.push(cardResource);
        player.totalResources += 1;
        player.resourcesRemaining += 1;

        await this.checkStartActionPhase()
    }

    public async skipResource(playerId: PlayerID) {
        let player = this.players[playerId]!
        player.cardsToResource = 0
        await this.checkStartActionPhase()
    }
}