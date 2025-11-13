import { Arena, Base, CardActive, CardID, CardUID, Game, PlayerID, PlayerState } from "../models/game";
import { GameClass } from "./gameClass";

export enum ReturnTrigger {
    /**
     * Continue like normal
     */
    CONTINUE = "",
    /**
     * Pause execution for ability target
     */
    STOP = "Stop",
    /**
     * // Cancel this action and the parent
     */
    CANCEL = "Cancel", 
    /**
     * This stack item has finished, but still has children
     */
    ENDED = "Ended"
}

export enum ExecutionStep {
    NONE = "NONE",
    CALC_COST = "CALC_COST",
    POST_PLAY = "POST_PLAY",
    CHECK_ATTACK = "CHECK_ATTACK",
    ATTACK = "ATTACK",
    ATTACKER_DEAL_DAMAGE = "ATTACKER_DEAL_DAMAGE",
    DEFENDER_COUNTER = "DEFENDER_COUNTER",
    DEFENDER_DEAL_DAMAGE = "DEFENDER_DEAL_DAMAGE",
    POST_ATTACK = "POST_ATTACK",
    CHECK_DEFEAT = "CHECK_DEFEAT",
    DEFEAT = "DEFEAT",
}

export enum Trigger {
    /** After card is on the ground/space
     * 
     * Data: cardID
     */
    PLAY,
    /**
     * Card is confirmed defeated
     * 
     * Data: cardID
     */
    DEFEAT,

    /** Before maybe attack takes place
     * 
     *  Data: attackerID, defenderID
    */
    CHECK_UNIT_ATTACK,

    /** Before confirmed attack takes place
     * 
     *  Data: attackerID, defenderID
    */
    UNIT_ATTACK,

    /**
     * After attack has dealt damage, after units are defeated
     * 
     * Data: attackerID, defenderID
     */
    POST_UNIT_ATTACK,

    /** Before maybe base attack takes place
     * 
     *  Data: attackerID, defenderPlayerID
    */
    CHECK_BASE_ATTACK,

    /** Before attack takes place
     * 
     *  Data: attackerID, defenderPlayerID
    */
    BASE_ATTACK,

    /** Right before deal damage
     * 
     *  Data: dealerID, attackerID, defenderID, amount
     * 
     *  Update amount if data changes
     * 
     *  Return true to cancel all damage
    */
    DEAL_DAMAGE,
    REGROUP,
    TAKE_COMBAT_DAMAGE,

    /** After a damage update happens
     * 
     *  Data: cardID
    */
    DAMAGE_CHANGES,

    /** Calculating final cost of card
     * 
     *  Data: cardID, amount
     * 
     *  Update amount if data changes
    */
    CALC_COST,
    CARD_ENTER_LEAVE,
    /** Before maybe defeat takes place
     * 
     *  Data: cardID
    */
    CHECK_DEFEAT,
}   

export enum EffectDuraction {
    END_OF_ATTACK,
    END_OF_PHASE,
    CARD_ENTER_LEAVE,
    DAMAGE_CHANGES,
    NEVER
}

export enum Keyword {
    RAID,
    OVERWHELM,
    SENTINAL,
    AMBUSH, 
    GRIT,
    HIDDEN,
    UNATTACKABLE,
}

export interface CardKeyword {
    keyword: Keyword,
    number: number,
}

export enum AbilityType { // Type so stack knows which dictionary ability is in
    KEYWORD,
    UPGRADE,
    CARD,
}

export interface Ability {
    trigger: Trigger,
    effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => ReturnTrigger | void,
}

export interface Upgrade {
    power: number,
    hp: number,
    duration: EffectDuraction,
    abilityID?: CardUID,
    keyword?: CardKeyword,
}

export enum TokenUnit {
    CLONE_TROOPER = "3941784506",
}


export const KeyWordAbilites: {[key in Keyword]: Ability[]} = {
    [Keyword.RAID]: [
        {
            trigger: Trigger.UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                if (attackerID != thisCard.cardID) return;

                let upgrade: Upgrade = {
                    power: number || 1,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                }
                game.applyUpgrade(thisCard, upgrade)
            }
        },
        {
            trigger: Trigger.BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                if (attackerID != thisCard.cardID) return;

                let upgrade: Upgrade = {
                    power: number || 1,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                }
                game.applyUpgrade(thisCard, upgrade)
            }
        }
    ],

    [Keyword.OVERWHELM]: [
        {
            trigger: Trigger.DEAL_DAMAGE,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let dealerID: CardID = data.dealerID;
                let attackerID: CardID = data.attackerID;
                if (dealerID != thisCard.cardID) return;
                if (attackerID != thisCard.cardID) return;

                let damage: number = data.damage;
                let defender: CardActive | undefined = game.findUnitAnyPlayer(data.defenderID);
                if (!defender) return
                let baseDamage = 0;
                if (damage > (defender.hp - defender.damage)) {
                    baseDamage = damage - (defender.hp - defender.damage)
                    let enemyBase: Base = game.players[defender.controllerID]?.base!
                    enemyBase.damage += baseDamage
                    // Base Damage Trigger
                } 
            }
        }
    ],
    [Keyword.SENTINAL]: [
        {
            trigger: Trigger.CHECK_UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                let defenderID: CardID = data.defenderID;
                let attacker: CardActive = game.findUnitAnyPlayer(attackerID)!;
                let defender: CardActive = game.findUnitAnyPlayer(defenderID)!;
                // Ignore if the defender and sentinal are different teams
                if (defender.controllerID != thisCard.controllerID) {
                    return ReturnTrigger.CONTINUE
                }
                // Ignore if the defender has sentinal
                if (defender.keywords.find(
                    (keyword: CardKeyword) => keyword.keyword == Keyword.SENTINAL
                )) {
                    return ReturnTrigger.CONTINUE
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return ReturnTrigger.CANCEL
                }
            }
        },
        {
            trigger: Trigger.CHECK_BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                let attacker: CardActive = game.findUnitAnyPlayer(attackerID)!;
                let defenderPlayerID: PlayerID = data.defenderPlayerID
                
                // Ignore if the defender and sentinal are different teams
                if (defenderPlayerID != thisCard.controllerID) {
                    return ReturnTrigger.CONTINUE
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return ReturnTrigger.CANCEL
                }
            }
        },
    ],
    [Keyword.AMBUSH]: [
        {
            trigger: Trigger.PLAY,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                
            }
        }
    ],
    [Keyword.GRIT]: [
        {
            trigger: Trigger.DAMAGE_CHANGES,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let upgrade: Upgrade = {
                    power: thisCard.damage,
                    hp: 0,
                    duration: EffectDuraction.DAMAGE_CHANGES,
                }
                game.applyUpgrade(thisCard, upgrade)
            }
        }
    ],
    [Keyword.HIDDEN]: [
        {
            trigger: Trigger.PLAY,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let cardID: CardID = data.cardID;
                if (cardID == thisCard.cardID) {
                    let upgrade: Upgrade = {
                        power: 0,
                        hp: 0,
                        duration: EffectDuraction.END_OF_PHASE,
                        keyword: {
                            keyword: Keyword.UNATTACKABLE,
                            number: 0
                        }
                    }
                    game.applyUpgrade(thisCard, upgrade)
                }
            }
        },
    ],
    [Keyword.UNATTACKABLE]: [
        {
            trigger: Trigger.CHECK_UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let defenderID: CardID = data.defenderID;
                if (defenderID == thisCard.cardID) {
                    return ReturnTrigger.CANCEL // Cancel attack if attacking this unit
                }
            }
        },
    ],
}

export const CardIDKeywords: {[key in CardUID]: CardKeyword[]} = {
    ["9127322562"]: [ // Surface Assault Bomber
        {
            keyword: Keyword.RAID,
            number: 1
        }
    ],
    ["3347454174"]: [ // Daro Commando
        {
            keyword: Keyword.OVERWHELM,
            number: 0
        }
    ],
    ["1087522061"]: [ // AT-DP Occupier
        {
            keyword: Keyword.OVERWHELM,
            number: 0
        }
    ],
    ["7983965297"]: [ // Defense Fleet X-Wing
        { keyword: Keyword.SENTINAL, number: 0}
    ],
    ["7504035101"]: [ // Loth-Wolf
        { keyword: Keyword.SENTINAL, number: 0}
    ],
    ["7742118411"]:  [ // Vulptex
        { keyword: Keyword.HIDDEN, number: 0}
    ],
    ["6930799884"]:  [ // A-Wing
        { keyword: Keyword.RAID, number: 1}
    ],
}



export const CardIDAbilities: {[key in CardUID]: Ability[]} = {
    ["1087522061"]: [ // AT-DP Occupier
        {
            // Reduce cost by 1 for every damaged ground unit
            trigger: Trigger.CALC_COST,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.cardID == thisCard.cardID) {
                    let cards = game.getEveryUnit()
                    for (let card of cards) {
                        if (card.damage > 0 && card.arena == Arena.GROUND)
                            data.amount -= 1
                    }
                }
            }
        }
    ],
    ["8401089833"]: [ // Rebellion Y-Wing
        {
            trigger: Trigger.UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                let defenderID: CardID = data.defenderID;
                if (attackerID != thisCard.cardID) return;
                let defender: CardActive = game.findUnitAnyPlayer(defenderID)!;

                // TODO Multiplayer Fix (could be any base)
                let defenderPlayerID = defender.controllerID
                game.players[defenderPlayerID]!.base.damage += 1
            }
        },
        {
            trigger: Trigger.BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                if (attackerID != thisCard.cardID) return;
                let defenderPlayerID: PlayerID = data.defenderPlayerID
                game.players[defenderPlayerID]!.base.damage += 1
            }
        }
    ],
    ["8954587682"]: [ // Super laser technician
        {
            // become a ready resource
            trigger: Trigger.DEFEAT,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.cardID != thisCard.cardID) return
                game.players[thisCard.controllerID]?.resources.push(
                    {
                        ownerID: thisCard.ownerID,
                        cardID: thisCard.cardID,
                        cardUid: thisCard.cardUid
                    }
                )
                game.players[thisCard.controllerID]!.totalResources += 1;
                game.players[thisCard.controllerID]!.resourcesRemaining += 1;
            }
        }
    ],
    ["9394156877"]: [ // Dhani Pilgrim
        {
            // heal base 1
            trigger: Trigger.DEFEAT,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.cardID != thisCard.cardID) return
                game.players[thisCard.controllerID]!.base.damage -= 1;
                if (game.players[thisCard.controllerID]!.base.damage < 0) {
                    game.players[thisCard.controllerID]!.base.damage = 0
                }

            }
        },
        {
            // heal base 1
            trigger: Trigger.PLAY,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.cardID != thisCard.cardID) return
                game.players[thisCard.controllerID]!.base.damage -= 1;
                if (game.players[thisCard.controllerID]!.base.damage < 0) {
                    game.players[thisCard.controllerID]!.base.damage = 0
                }

            }
        }
    ],
    ["4328408486"]: [ // Incinerator Trooper
        { 
            // Ability is to deal damage before the defender
            // Solution is to block damage dealtt during attack, and 
            // give defender upgrade to deal damage post_attack
            trigger: Trigger.DEAL_DAMAGE,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                if (data.defenderID != data.dealerID) return
                // Don't block damage if marked by self (marked means he already blocked the damage earlier)
                if (thisCard.upgrades.find((u: Upgrade) => u.abilityID == "4328408486_2")) return 
                let defender: CardActive = game.findUnitAnyPlayer(data.defenderID)!;
                let upgrade: Upgrade = {
                    power: 0,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                    abilityID: "4328408486",
                }
                game.applyUpgrade(defender, upgrade)
                let upgrade2: Upgrade = {
                    power: 0,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                    abilityID: "4328408486_2",
                }
                game.applyUpgrade(thisCard, upgrade2)
                return ReturnTrigger.CANCEL
            }
        }]
}



export const UpgradeCardIDAbilities: {[key in CardUID]: Ability[]} = {
    ["4328408486"]: [ // Incinerator Trooper mechanics
        {
            // This upgrade allows for damage after the attack from the defender
            trigger: Trigger.POST_UNIT_ATTACK, // expires after this
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.defenderID != thisCard.cardID) return
                let attacker = game.findUnitAnyPlayer(data.attackerID)
                if (!attacker) return
                if (attacker.cardUid != "4328408486") return

                game.dealDamage(thisCard.cardID, data.attackerID, data.defenderID, thisCard.power)
                return ReturnTrigger.ENDED
            }
        }
    ],
    ["4328408486_2"]: [], // Incinerator Trooper marker to no longer block defender damage
}
