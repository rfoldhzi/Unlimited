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
    initiativeClaimed: boolean;
    winner: PlayerID | undefined;

    public constructor(data: Game) {
        this.data = data
        this.gameID = data.gameID;
        this.players = data.players;
        this.name = data.name;
        this.initiative = data.initiative
        this.cardCount = data.cardCount
        this.phase = data.phase;
        this.turn = data.turn;
        this.initiativeClaimed = data.initiativeClaimed;
        this.winner = data.winner;
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

    public async victory(playerID: PlayerID) {
        this.data.phase = Phase.GAME_OVER;
        this.data.winner = playerID;
    }

    /**
     * ACTION
     * 
     * @param playerID 
     * @param attackerID 
     * @param defenderID 
     * @returns 
     */
    public async attackCard(playerID: PlayerID, attackerID: CardID, defenderID: CardID) {
        if (this.data.turn != playerID) {
            console.log("Cannot attack: Not this player's turn!")
            return
        }
        
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
    
        await this.endTurn()
    }

    /**
     * ACTION
     * 
     * @param playerID 
     * @param attackerID 
     * @param defenderPlayerID 
     * @returns 
     */
    public async attackBase(playerID: PlayerID, attackerID: CardID, defenderPlayerID: PlayerID) {
        if (this.data.turn != playerID) {
            console.log("Cannot attack: Not this player's turn!")
            return
        }
        
        let attacker = this.findUnitByPlayer(playerID, attackerID)
        let defenderBase = this.players[defenderPlayerID]?.base
        console.log("attacker",attacker)
        console.log("defender",defenderBase)
        if (!attacker) {
            console.log("Declined Attack: Can't find attacker")
            return
        }
        if (!defenderBase) {
            console.log("Declined Attack: Can't find defenderBase")
            return
        }
        if (attacker.controllerID == defenderPlayerID) {
            console.log("Declined Attack: Can't attack card on same team")
            return
        }
        if (!attacker.ready) {
            console.log("Declined Attack: Attacker must be ready")
            return
        }

        attacker.ready = false
        defenderBase.damage += attacker.power

        if (defenderBase.damage >= defenderBase.hp) this.victory(playerID)
    
        await this.endTurn()
    }

    public async drawCard(playerId: PlayerID) {
        let player = this.players[playerId]!
        let cardUid = player.deck.pop() as CardUID // Draw from the end of the list
        player.hand.push(cardUid)
    }

    /**
     * ACTION
     * 
     * @param cardUid 
     * @param playerId 
     * @returns 
     */
    public async playCard(cardUid: CardUID, playerId: PlayerID) {
        if (this.data.turn != playerId) {
            console.log("Cannot play card: Not this player's turn!")
            return
        }

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

        await this.endTurn()
    }

    public async regroup() {
        this.data.phase = Phase.REGROUP
        this.data.initiativeClaimed = false
        for (let playerID in this.players) {
            console.log("cleaning player", playerID)
            let player = this.data.players[playerID]!
            for (let c of player.groundArena) {
                c.ready = true
            }
            for (let c of player.spaceArena) {
                c.ready = true
            }
            player.resourcesRemaining = player.totalResources;
            await this.drawCard(playerID);
            await this.drawCard(playerID);
            player.finished = false;
            console.log("cardsToResource1", player.cardsToResource)
            player.cardsToResource = 1;
            console.log("cardsToResource2", player.cardsToResource)
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

    /**
     * ACTION
     * @param playerId 
     */
    public async playerFinish(playerId: PlayerID) {
        if (this.data.turn != playerId) {
            console.log("Cannot finsih and pass: Not this player's turn!")
            return
        }
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
        } else {
            await this.endTurn()
        }
    }

    /**
     * ACTION
     * 
     * @param playerId 
     * @returns 
     */
    public async claimInitiative(playerId: PlayerID) {
        if (this.data.turn != playerId) {
            console.log("Cannot claim initiative: Not this player's turn!")
            return
        }
        if (this.data.initiativeClaimed) {
            console.log("cannot calim initive: Already claimed")
            return
        }
        this.data.initiative = playerId
        this.data.initiativeClaimed = true
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
        player.cardsToResource -= 1;

        await this.checkStartActionPhase()
    }

    public async skipResource(playerId: PlayerID) {
        let player = this.players[playerId]!
        player.cardsToResource = 0
        await this.checkStartActionPhase()
    }

    public async endTurn() {
        console.log("end turn called")
        let allPlayersFinished = true;
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            if (!player.finished) {
                allPlayersFinished = false
            }
        }
        if (allPlayersFinished) {
            console.log("regrouping...")
            await this.regroup()
            return
        }

        let turnOrder: PlayerID[] = Object.keys(this.data.players)
        let i = turnOrder.indexOf(this.data.turn)
        if (i == -1) {
            console.log("cannot end turn: Current turn invalid", this.data.turn)
            return 
        }
        console.log("turn Order1", turnOrder, i, turnOrder[i])
        let counter = 0
        while (counter < turnOrder.length) {
            i = (i+1) % turnOrder.length
            if (!this.players[turnOrder[i] as any]!.finished) {
                this.data.turn = turnOrder[i] as PlayerID
                console.log("turn Order2", turnOrder, i, turnOrder[i])
                return;
            }
            counter += 1
        }
        console.log("turn Order3", turnOrder, i, turnOrder[i])
        console.log("went through all players, couldn't find one ready??")
    }
}