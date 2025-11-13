import { Game, PlayerState, CardUID, PlayerID, Arena, CardID, CardActive, Phase, CardResource, Leader, Aspect, SubPhase, StackItem, StackFunctionType } from "../models/game";
import { Ability, AbilityType, CardIDAbilities, CardIDKeywords, CardKeyword, EffectDuraction, ExecutionStep, Keyword, KeyWordAbilites, ReturnTrigger, TokenUnit, Trigger, Upgrade, UpgradeCardIDAbilities } from "./abilities";
import { createCard } from "./gameHandler";


export class GameClass {
    // gameID: number;
    players: { [playerID: string]: PlayerState; };
    // name: string;
    // initiative: PlayerID | null;
    // cardCount: number;
    data: Game;
    // phase: Phase;
    // turn: PlayerID;
    // initiativeClaimed: boolean;
    // winner?: PlayerID;
    // subPhase: SubPhase;
    // targets: any[];
    targetCount?: { min: Number; max: Number; };

    public constructor(data: Game) {
        this.data = data
        // this.gameID = data.gameID;
        this.players = data.players;
        // this.name = data.name;
        // this.initiative = data.initiative
        // this.cardCount = data.cardCount
        // this.phase = data.phase;
        // this.turn = data.turn;
        // this.initiativeClaimed = data.initiativeClaimed;
        // this.subPhase = data.subPhase;
        // this.targets = data.targets;
    }

    /**
     * Get current stack item
     * @returns StackItem
     */
    private stack(): StackItem {
        if (Array.isArray(this.data.stack[0])) {
            return this.data.stack[0][0]!
        }
        return this.data.stack[0]!
    }
    /**
     * Get ExecutionStep of current StackItem
     * @returns ExecutionStep
     */
    private getStep(): ExecutionStep {
        return this.stack().step || ExecutionStep.NONE
    }
    /**
     * Set ExecutionStep of current StackItem
     * @param step ExecutionStep
     */
    private setStep(step: ExecutionStep) {
        this.stack().step = step
    }
    private handleReturn(returnValue: ReturnTrigger): boolean {
        return returnValue != ReturnTrigger.CONTINUE
    }
    /**
     * Store local variables of a function here
     * @returns object
     */
    private heap(): any {
        return this.data.heap![0]
    }
    /**
     * Only used when by stack creation helper methods
     */
    private newHeap(): void {
        this.data.heap.unshift({})
    }
    /**
     * Basically input function parameters as an object
     * @returns Any format
     */
    private getInput(): any {
        if (Array.isArray(this.data.stack[0])) {
            return this.data.stack[0][0]!.input
        }
        return this.data.stack[0]!.input
    }
    /**
     * Get output from child stack item
     * @returns any formart
     */
    private getChildOutput(): any {
        if (Array.isArray(this.data.stack[0])) {
            return this.data.stack[0][0]!.childOutput
        }
        return this.data.stack[0]!.childOutput
    }
    /**
     * Output returned to parent stack item
     * @param output 
     */
    private setOutput(output: any): void {
        if (Array.isArray(this.data.stack[1])) {
            this.data.stack[1][0]!.childOutput = output
        }
        (this.data.stack[1]! as StackItem).childOutput = output
    }

    /**
     * Input data for abilities. Refer to Trigger Enum for format data
     * @param data format depends on Trigger Enum
     */
    public setTriggerData(data: any) {
        if (Array.isArray(this.data.stack[0])) {
            this.data.stack[0][0]!.triggerData = data
        }
        (this.data.stack[0]! as StackItem).triggerData = data
    }


    /**
     * Gets triggerData from self. Useful to see if abilities changed any data
     * @returns triggerData
     */
    public getTriggerData(): any {
        if (Array.isArray(this.data.stack[0])) {
            return this.data.stack[0][0]!.triggerData
        }
        return this.data.stack[0]!.triggerData
    }

    /**
     * Gets trigger data from parent stack item. Used for abilities
     * @returns triggerData
     */
    public getParentTriggerData(): any {
        if (Array.isArray(this.data.stack[1])) {
            return this.data.stack[1][0]!.triggerData
        }
        return this.data.stack[1]!.triggerData
    }
    /**
     * Set parent's return trigger data
     * @param returnTrigger 
     */
    public setTriggerReturn(returnTrigger: ReturnTrigger): void {
        if (this.getParentTriggerData())
            this.getParentTriggerData().triggerReturn = returnTrigger
    }
    /**
     * Gets ReturnTrigger from last child stack call
     * @returns 
     */
    public getTriggerReturn(): ReturnTrigger | undefined {
        if (this.getTriggerData())
            return this.getTriggerData().triggerReturn
        return undefined
    }

    /**
     * Find in-play unit across all players
     * @param cardID id you are looking for
     * @returns CardActive
     */
    public findUnitAnyPlayer(cardID: CardID): CardActive | undefined {
        let card: CardActive | undefined
        if (this.data.playedCard?.cardID == cardID) return this.data.playedCard
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

    public defeatCard(card: CardActive) {
        let player = this.players[card.controllerID]!
        let list: CardActive[]
        if (card.arena == Arena.GROUND) {
            list = player.groundArena
        } else {
            list = player.spaceArena
        }

        let index = list.indexOf(card)
        if (index != -1) {
            list.splice(index, 1)
        } else {
            console.log("cannot find card in arena")
            // we cant play the card
            return
        }
    }

    private async stack_defeatCard() {
        let cardID: CardID = this.getInput().cardID

        if (this.getStep() == ExecutionStep.NONE) {
            this.setStep(ExecutionStep.CHECK_DEFEAT)
            this.setTriggerData({
                cardID: cardID,
            })
            this.triggerAbility(Trigger.CHECK_DEFEAT)
            return
        }
        if (this.getStep() == ExecutionStep.CHECK_DEFEAT) {
            if (this.getTriggerReturn() == ReturnTrigger.CANCEL) {
                console.log("defeat canceled")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            this.setStep(ExecutionStep.DEFEAT)
            this.setTriggerData({
                cardID: cardID,
            })
            this.triggerAbility(Trigger.DEFEAT)
            return
        }
        if (this.getStep() == ExecutionStep.DEFEAT) {
            let card = this.findUnitAnyPlayer(cardID)
            if (card)
                this.defeatCard(card)
            return this.releaseStack()
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
        this.createStackFunction(StackFunctionType.END_TURN, {})
        this.createStackFunction(StackFunctionType.ATTACK_UNIT, {
            attackerID: attackerID,
            defenderID: defenderID,
            playerID: playerID,
        })
        await this.runStack()
    }

    public async stack_attackCard() {
        let playerID: PlayerID = this.getInput().playerID
        let attackerID: CardID = this.getInput().attackerID
        let defenderID: CardID = this.getInput().defenderID

        
        let attacker = this.findUnitByPlayer(playerID, attackerID)
        let defender = this.findUnitAnyPlayer(defenderID)
        if (!attacker) {
            console.log("attacker", attacker)
            console.log("defender", defender)
            console.log("Declined Attack: Can't find attacker ._.")
            this.setOutput(ReturnTrigger.CANCEL)
            return this.releaseStack()
        }
        if (!defender) {
            console.log("Declined Attack: Can't find defender ._.")
            this.setOutput(ReturnTrigger.CANCEL)
            return this.releaseStack()
        }

        if (this.getStep() == ExecutionStep.NONE) {

            if (this.data.turn != playerID) {
                console.log("Cannot attack: Not this player's turn!")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }

            if (attacker.controllerID == defender.controllerID) {
                console.log("Declined Attack: Can't attack card on same team")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            if (!attacker.ready) {
                console.log("Declined Attack: Attacker must be ready")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            this.setStep(ExecutionStep.CHECK_ATTACK)
            this.setTriggerData({
                attackerID: attackerID,
                defenderID: defenderID,
            })
            this.triggerAbility(Trigger.CHECK_UNIT_ATTACK)
            return
        }

        if (this.getStep() == ExecutionStep.CHECK_ATTACK) {
            console.log("CHECK ATTACK")
            if (this.getTriggerReturn() == ReturnTrigger.CANCEL) {
                console.log("attack canceled")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            
            this.setStep(ExecutionStep.ATTACK)
            this.setTriggerData({
                attackerID: attackerID,
                defenderID: defenderID,
            })
            this.triggerAbility(Trigger.UNIT_ATTACK)
            return
        }

        if (this.getStep() == ExecutionStep.ATTACK) {

            attacker.ready = false
            console.log("ATTACKER", attacker)

            this.setStep(ExecutionStep.ATTACKER_DEAL_DAMAGE)
            this.setTriggerData({
                dealer: attackerID,
                attackerID: attackerID,
                defenderID: defenderID,
                amount: attacker.power
            })
            console.log("triggered deal damage, step is",this.getStep()) 
            this.triggerAbility(Trigger.DEAL_DAMAGE)
            return
        }

        if (this.getStep() == ExecutionStep.ATTACKER_DEAL_DAMAGE) {
            this.setStep(ExecutionStep.DEFENDER_COUNTER)

            if (this.getTriggerReturn() != ReturnTrigger.CANCEL) {
                // Deal damage to defender because damage wasn't canceled
                console.log("TRIGGER")
                defender.damage += this.getTriggerData().amount // Here we can expect the data to change with the ability
                this.upgradeRemoval(EffectDuraction.DAMAGE_CHANGES);
                this.setTriggerData({
                    cardID: defenderID
                })
                this.triggerAbility(Trigger.DAMAGE_CHANGES)
            }
            return
        }

        if (this.getStep() == ExecutionStep.DEFENDER_COUNTER) {
            this.setStep(ExecutionStep.DEFENDER_DEAL_DAMAGE)
            this.setTriggerData({
                dealer: attackerID,
                attackerID: attackerID,
                defenderID: defenderID,
                amount: defender.power
            })
            this.triggerAbility(Trigger.DEAL_DAMAGE)
            return
        }
        if (this.getStep() == ExecutionStep.DEFENDER_DEAL_DAMAGE) {
            this.setStep(ExecutionStep.POST_ATTACK)

            if (this.getTriggerReturn() != ReturnTrigger.CANCEL) {
                // Deal damage to attacker because damage wasn't canceled
                attacker.damage += this.getTriggerData().amount // Here we can expect the data to change with the ability
                this.upgradeRemoval(EffectDuraction.DAMAGE_CHANGES);
                this.setTriggerData({
                    cardID: attackerID
                })
                this.triggerAbility(Trigger.DAMAGE_CHANGES)
            }
            return
        }

        if (this.getStep() == ExecutionStep.POST_ATTACK) {
            this.stack().ended = true // Instead of simply releasing stack, mark this as ended in case there are deaths and they created child events. 
            
            if (attacker.damage >= attacker.hp) 
                this.createStackFunction(StackFunctionType.DEFEAT, {
                    cardID: attacker.cardID
                })
            if (defender.damage >= defender.hp)
                this.createStackFunction(StackFunctionType.DEFEAT, {
                    cardID: defender.cardID
                })

            this.upgradeRemoval(EffectDuraction.END_OF_ATTACK);
            return 
            // return this.releaseStack()
        }
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
        this.createStackFunction(StackFunctionType.END_TURN, {})
        this.createStackFunction(StackFunctionType.ATTACK_BASE, {
            attackerID: attackerID,
            defenderPlayerID: defenderPlayerID,
            playerID: playerID,
        })
        await this.runStack()
        return
    }

    public async stack_attackBase() {
        let playerID: PlayerID = this.getInput().playerID
        let attackerID: CardID = this.getInput().attackerID
        let defenderPlayerID: PlayerID = this.getInput().defenderPlayerID

        
        let attacker = this.findUnitByPlayer(playerID, attackerID)
        let defenderBase = this.players[defenderPlayerID]?.base

        if (!attacker) {
            console.log("attacker", attacker)
            console.log("Declined Attack: Can't find attacker ._.")
            this.setOutput(ReturnTrigger.CANCEL)
            return this.releaseStack()
        }
        if (!defenderBase) {
            console.log("Declined Attack: Can't find defenderBase ._.")
            this.setOutput(ReturnTrigger.CANCEL)
            return this.releaseStack()
        }

        if (this.getStep() == ExecutionStep.NONE) {

            if (this.data.turn != playerID) {
                console.log("Cannot attack: Not this player's turn!")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }

            if (attacker.controllerID == defenderPlayerID) {
                console.log("Declined Attack: Can't attack base on same team")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            if (!attacker.ready) {
                console.log("Declined Attack: Attacker must be ready")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            this.setStep(ExecutionStep.CHECK_ATTACK)
            this.setTriggerData({
                attackerID: attackerID,
                defenderPlayerID: defenderPlayerID,
            })
            this.triggerAbility(Trigger.CHECK_BASE_ATTACK)
            return
        }

        if (this.getStep() == ExecutionStep.CHECK_ATTACK) {
            console.log("CHECK ATTACK")
            if (this.getTriggerReturn() == ReturnTrigger.CANCEL) {
                console.log("attack canceled")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            
            this.setStep(ExecutionStep.ATTACK)
            this.setTriggerData({
                attackerID: attackerID,
                defenderPlayerID: defenderPlayerID,
            })
            this.triggerAbility(Trigger.BASE_ATTACK)
            return
        }

        if (this.getStep() == ExecutionStep.ATTACK) {

            attacker.ready = false
            console.log("ATTACKER", attacker)

            attacker.ready = false
            defenderBase.damage += attacker.power

            if (defenderBase.damage >= defenderBase.hp) this.victory(playerID)
            this.upgradeRemoval(EffectDuraction.END_OF_ATTACK);
            return this.releaseStack()
        }
    }

    public async drawCard(playerId: PlayerID) {
        let player = this.players[playerId]!
        let cardUid = player.deck.pop() as CardUID // Draw from the end of the list
        player.hand.push(cardUid)
    }

    public cancel() {
        this.getTriggerData().triggerOutput = ReturnTrigger.CANCEL
    }

    private executeAbility(stack: StackItem): ReturnTrigger {
        let card = this.findUnitAnyPlayer(stack.input.cardID)
        if (card == null) {
            console.log("couldn't find card ability")
            return ReturnTrigger.CONTINUE
        }
        let ability: Ability
        let out: ReturnTrigger | void = undefined
        switch (stack.input.abilityType) {
            case AbilityType.KEYWORD:
                ability = KeyWordAbilites[stack.input.abilityKey as Keyword][stack.input.abilityIndex]!
                out = ability.effect(card, this, this.getParentTriggerData(), stack.input.number)
                break;
            case AbilityType.UPGRADE:
                ability = UpgradeCardIDAbilities[stack.input.abilityKey as CardUID]![stack.input.abilityIndex]!
                out = ability.effect(card, this, this.getParentTriggerData())
                break;
            case AbilityType.CARD:
                ability = CardIDAbilities[stack.input.abilityKey as CardUID]![stack.input.abilityIndex]!
                out = ability.effect(card, this, this.getParentTriggerData())
                break;
        }
        console.log("CARD", card)
        if (out == ReturnTrigger.CANCEL)
            this.setTriggerReturn(out)
        if (out == ReturnTrigger.ENDED) 
            stack.ended = true;
        else
            this.releaseStack()
        if (out == undefined) return ReturnTrigger.CONTINUE
        return out
    }

    private async executeStackItem(): Promise<ReturnTrigger> {
        console.log("Running Stack", this.stack())
        if (this.stack().ended) {
            this.releaseStack()
            return ReturnTrigger.CONTINUE
        }
        switch (this.stack().function) {
            case StackFunctionType.PLAY_CARD:
                await this.stack_playCard()
                break;
            case StackFunctionType.ATTACK_UNIT:
                await this.stack_attackCard()
                break;
            case StackFunctionType.ATTACK_BASE:
                await this.stack_attackBase()
                break;
            case StackFunctionType.CALC_COST:
                this.stack_calculateCardCost()
                break;
            case StackFunctionType.END_TURN:
                await this.endTurn()
                break;
            case StackFunctionType.ABILITY:
                return this.executeAbility(this.stack())
            case StackFunctionType.DEFEAT:
                this.stack_defeatCard()
                break
        }
        return ReturnTrigger.CONTINUE
    }

    private async runStack() {
        while (this.data.stack.length > 0) {
            let out = await this.executeStackItem()
            if (out == ReturnTrigger.STOP) return
        }
    }

    private createStackFunction(func: StackFunctionType, input: any) {
        this.data.stack.unshift({
            function: func,
            step: ExecutionStep.NONE,
            input: input,
            childOutput: null,
            triggerData: undefined,
            triggerReturn: ReturnTrigger.CONTINUE,
            ended: false,
        })
        this.newHeap()
    }

    private createAbilityStackFunction(func: StackFunctionType, input: any) {
        (this.data.stack[0] as StackItem[]).unshift({
            function: func,
            step: ExecutionStep.NONE,
            input: input,
            childOutput: null,
            triggerData: undefined,
            triggerReturn: ReturnTrigger.CONTINUE,
            ended: false
        })
        this.newHeap()
    }

    /**
     * Call at end of canoical step.
     * Recommended to use "return this.releaseStack()" to make sure nothing is ran after this
     * Otherwise, it could cause issues in the stack with output
     */
    private releaseStack() {
        if (Array.isArray(this.data.stack[0])) { // If current stack is ability list, remove from the list
            this.data.stack[0].shift()
            if (this.data.stack[0].length == 0) {
                this.data.stack.shift()
            }
        } else {
            this.data.stack.shift()
        }
        this.data.heap.shift()
    }



    private stack_calculateCardCost() {

        let card: CardActive = this.getInput().card
        let playerId: PlayerID = this.getInput().playerId

        if (this.getStep() == ExecutionStep.NONE) {
            let cost = card.cost;

            let aspectPenalty = 0;
            let cardAspects = card.aspectCost;
            let ownedAspects = []
            let player = this.players[playerId]!
            player.leaders.forEach((leader: Leader) => {
                leader.aspects.forEach((aspect: Aspect) => ownedAspects.push(aspect))
            })
            ownedAspects.push(player.base.aspect)


            cardAspects.forEach((aspect: Aspect) => {
                let index = ownedAspects.indexOf(aspect)
                if (index == -1) {
                    aspectPenalty += 2
                } else {
                    ownedAspects.splice(index, 1)
                }
            });


            this.setStep(ExecutionStep.CALC_COST)
            this.setTriggerData({
                cardID: card.cardID,
                amount: cost + aspectPenalty,
            })
            this.triggerAbility(Trigger.CALC_COST)
            return
        }

        if (this.getStep() == ExecutionStep.CALC_COST) {

            if (this.getTriggerData().amount < 0) {
                this.setOutput({ cost: 0, out: this.getTriggerReturn() })
                return this.releaseStack() // Must be last
            }

            this.setOutput({ cost: this.getTriggerData().amount, out: this.getTriggerReturn() })
            return this.releaseStack() // Must be last
        }
        throw new Error("Shouldn't be able to reach here: Execution Step invalid");
    }

    /**
     * ACTION
     * 
     * @param cardUid 
     * @param playerId 
     * @returns 
     */
    public async playCard(cardUid: CardUID, playerId: PlayerID) {
        this.createStackFunction(StackFunctionType.END_TURN, {})
        this.createStackFunction(StackFunctionType.PLAY_CARD, {
            cardUid: cardUid,
            playerId: playerId,
        })
        await this.runStack()
    }

    /**
     * Input:
     * 
     * cardUid: CardUID
     * playerId: PlayerID
     */
    private async stack_playCard() {
        let cardUid: CardUID = this.getInput().cardUid
        let playerId: PlayerID = this.getInput().playerId

        // Generate card 
        if (this.getStep()== ExecutionStep.NONE) {
            if (this.data.turn != playerId) {
                console.log("Cannot play card: Not this player's turn!")
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }

            console.log("playCard1")

            this.heap().playerId = playerId
            let card = await createCard(cardUid)
            if (card == null) {
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }

            card.ownerID = playerId;
            card.controllerID = playerId;
            card.ready = false;

            this.data.cardCount += 1;
            card.cardID = this.data.cardCount;

            console.log("true heap", this.data.heap)
            console.log("heap",this.heap())

            this.heap().card = card
            this.data.playedCard = card;

            this.setStep(ExecutionStep.CALC_COST)
            this.createStackFunction(StackFunctionType.CALC_COST, {
                card: this.heap().card,
                playerId: this.heap().playerId,
            })
            return
        }

        if (this.getStep() == ExecutionStep.CALC_COST) {
            let result = this.getChildOutput() as { cost: number, out: ReturnTrigger }
            if (result.out == ReturnTrigger.CANCEL) {
                this.data.playedCard = undefined
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }
            let player = this.players[playerId]!
            if (result.cost > player.resourcesRemaining) {
                console.log("Cannot play card: Too expensive! Cost:", result.cost, "Resources:", player.resourcesRemaining)
                this.data.playedCard = undefined
                this.setOutput(ReturnTrigger.CANCEL)
                return this.releaseStack()
            }


            // find card in player's hand
            console.log("PLYER", player, player.hand, cardUid)
            let index = player.hand.indexOf(cardUid)
            if (index != -1) {
                player.hand.splice(index, 1)
            } else {
                console.log("cannot find card in hand")
                throw new Error("Why can't we find card in hand?");
            }

            player.resourcesRemaining -= result.cost

            // player.groundArena.push(card)
            if (this.heap().card.arena == Arena.GROUND) {
                player.groundArena.push(this.heap().card)
            } else if (this.heap().card.arena == Arena.SPACE) {
                player.spaceArena.push(this.heap().card)
            }

            this.data.playedCard = undefined

            this.setStep(ExecutionStep.POST_PLAY)
            this.setTriggerData({
                cardID: (this.heap().card as CardActive).cardID,
            })
            this.triggerAbility(Trigger.PLAY)
            return
        }
        if (this.getStep() == ExecutionStep.POST_PLAY) {
            return this.releaseStack() // Must be last step
        }
    }

    public async regroup() {

        this.upgradeRemoval(EffectDuraction.END_OF_PHASE);

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
            // TODO might need to fix this later
            this.createStackFunction(StackFunctionType.END_TURN, {})
            await this.runStack()
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
            player.hand.splice(index, 1)
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
        if (this.getChildOutput() == ReturnTrigger.CANCEL) {
            return this.releaseStack() // Don't end turn if canceled
        }
        console.log("end turn called")
        this.data.playedCard = undefined;

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
            this.releaseStack()
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
            i = (i + 1) % turnOrder.length
            if (!this.players[turnOrder[i] as any]!.finished) {
                this.data.turn = turnOrder[i] as PlayerID
                console.log("turn Order2", turnOrder, i, turnOrder[i])
                this.releaseStack()
                return;
            }
            counter += 1
        }
        console.log("turn Order3", turnOrder, i, turnOrder[i])
        console.log("went through all players, couldn't find one ready??")
    }

    public async applyUpgrade(card: CardActive, upgrade: Upgrade) {
        card.upgrades.push(upgrade);
        card.power += upgrade.power;
        card.hp += upgrade.hp;
        
    }

    public getEveryUnit(): CardActive[] {
        let unitList: CardActive[] = []
        for (let playerID in this.players) {
            let player = this.players[playerID]!
            for (let c of player.groundArena) {
                unitList.push(c)
            }
            for (let c of player.spaceArena) {
                unitList.push(c)
            }
        }
        return unitList
    }

    public triggerAbility(trigger: Trigger): ReturnTrigger {
        let cards = this.getEveryUnit();
        if (this.data.playedCard) {
            cards.push(this.data.playedCard)
        }
        this.data.stack.unshift([]) // New Stack Item list of all triggered abilities
        for (let card of cards) {
            // Trigger keyword abilities
            for (let keyword of card.keywords) {
                for (let index in KeyWordAbilites[keyword.keyword]) {
                    let ability = KeyWordAbilites[keyword.keyword][index]!
                    if (ability.trigger == trigger) {
                        this.createAbilityStackFunction(StackFunctionType.ABILITY, {
                            cardID: card.cardID,
                            abilityType: AbilityType.KEYWORD,
                            abilityKey: keyword.keyword,
                            abilityIndex: index,
                            number: keyword.number
                        })
                        // let output = ability.effect(card, this, data, keyword.number)
                        // if (output !== undefined) return output
                    }
                }
            }
            for (let upgrade of card.upgrades) {
                //Trigger card specific upgrade abilities
                if (UpgradeCardIDAbilities[upgrade.abilityID || ""]) { // Find ability based on id of card that created the upgrade
                    for (let index in UpgradeCardIDAbilities[upgrade.abilityID!]!) {
                        let ability = UpgradeCardIDAbilities[upgrade.abilityID!]![index]!
                        if (ability.trigger == trigger) {
                            this.createAbilityStackFunction(StackFunctionType.ABILITY, {
                                cardID: card.cardID,
                                abilityType: AbilityType.UPGRADE,
                                abilityKey: upgrade.abilityID,
                                abilityIndex: index,
                            })
                            // let output = ability.effect(card, this, data)
                            // if (output !== undefined) return output
                        }
                    }
                }
                // Trigger abilities of keywords on upgrades
                if (upgrade.keyword) {
                    for (let index in KeyWordAbilites[upgrade.keyword.keyword]) {
                        let ability = KeyWordAbilites[upgrade.keyword.keyword][index]!
                        if (ability.trigger == trigger) {
                            this.createAbilityStackFunction(StackFunctionType.ABILITY, {
                                cardID: card.cardID,
                                abilityType: AbilityType.KEYWORD,
                                abilityKey: upgrade.keyword.keyword,
                                abilityIndex: index,
                                number: upgrade.keyword.number
                            })
                            // let output = ability.effect(card, this, data, upgrade.keyword.number)
                            // if (output !== undefined) return output
                        }
                    }
                }
            }
            // Trigger card specific abilities
            if (CardIDAbilities[card.cardUid]) {
                for (let index in CardIDAbilities[card.cardUid]!) {
                    let ability = CardIDAbilities[card.cardUid]![index]!
                    if (ability.trigger == trigger) {
                        this.createAbilityStackFunction(StackFunctionType.ABILITY, {
                            cardID: card.cardID,
                            abilityType: AbilityType.CARD,
                            abilityKey: card.cardUid,
                            abilityIndex: index,
                        })
                        // let output = ability.effect(card, this, data)
                        // if (output !== undefined) return output
                    }
                }
            }
        }
        if ((this.data.stack[0] as StackItem[]).length == 0) {
            this.data.stack.shift() // Remove Stack Item list if no abilities triggered
        }
        return ReturnTrigger.CONTINUE
    }

    public upgradeRemoval(duration: EffectDuraction) {
        let cards = this.getEveryUnit();
        cards.forEach((card: CardActive) => {
            let i = card.upgrades.length - 1
            while (i >= 0) {
                let upgrade = card.upgrades[i]
                if (upgrade?.duration == duration) {
                    card.upgrades.splice(i, 1)
                    card.power -= upgrade.power
                    card.hp -= upgrade.hp
                }
                i--
            }
        })
    }

    //TODO finish
    public async targetAbility(minTargets: number, maxTargets: number) {
        this.data.targetCount = {
            min: minTargets,
            max: maxTargets,
        };
        this.data.subPhase = SubPhase.TARGET;
    }

    public async postBaseDamage() {

    }

    public async createTokenUnit(tokenUnit: TokenUnit, playerId: PlayerID) {

        let player = this.players[playerId]!
        let card = await createCard(tokenUnit)
        if (card == null) {
            return
        }

        card.ownerID = playerId;
        card.controllerID = playerId;

        this.data.cardCount += 1;
        card.cardID = this.data.cardCount;

        if (card.arena == Arena.GROUND) {
            player.groundArena.push(card)
        } else if (card.arena == Arena.SPACE) {
            player.spaceArena.push(card)
        }

    }
}