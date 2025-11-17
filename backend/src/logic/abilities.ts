import { Arena, Base, CardActive, CardID, CardUID, Game, PlayerID, PlayerState, TargetCount, TargetType } from "../models/game";
import { GameClass } from "./gameClass";
import { Token } from "./gameHandler";

export enum ReturnTrigger {
    /**
     * Continue like normal
     */
    CONTINUE = "",
    /**
     * Ability conditions not met
     */
    NO_EFFECT = "No_Effect",
    /**
     * Pause execution for ability target
     */
    TARGET = "Target",
    /**
     * // Cancel this action and the parent
     */
    CANCEL = "Cancel", 
    /**
     * This stack item has finished, but still has children
     */
    ENDED = "Ended",
    /**
     * This abilty stack has not finished, has children
     */
    UNFINISHED = "UNFINISHED",
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
    ABILITY_1 = "ABILITY_1",
    ABILITY_2 = "ABILITY_2",
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
     * Data: cardID, killerID
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
     *  Update data.amount if data changes
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
    UPGRADE,
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
    EXPLOIT,
}

export interface CardKeyword {
    keyword: Keyword,
    number: number,
}

export enum AbilityType { // Type so stack knows which dictionary ability is in
    KEYWORD,
    BUFF,
    CARD,
}

export interface Ability {
    trigger: Trigger,
    effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => ReturnTrigger | void,
}

export interface Buff {
    power: number,
    hp: number,
    duration: EffectDuraction,
    abilityID?: CardUID,
    keyword?: CardKeyword,
}

export const KeyWordAbilites: {[key in Keyword]: Ability[]} = {
    [Keyword.RAID]: [
        {
            trigger: Trigger.UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                if (attackerID != thisCard.cardID) return;

                let buff: Buff = {
                    power: number || 1,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                };
                game.applyBuff(thisCard, buff);
            }
        },
        {
            trigger: Trigger.BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                if (attackerID != thisCard.cardID) return;

                let buff: Buff = {
                    power: number || 1,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                };
                game.applyBuff(thisCard, buff);
            }
        }
    ],

    [Keyword.OVERWHELM]: [
        {
            trigger: Trigger.DEAL_DAMAGE,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let dealerID: CardID = data.dealerID;
                let attackerID: CardID = data.attackerID;
                if (dealerID != thisCard.cardID) return ReturnTrigger.NO_EFFECT;
                if (attackerID != thisCard.cardID) return ReturnTrigger.NO_EFFECT;

                let damage: number = data.damage;
                let defender: CardActive | undefined = game.findUnitAnyPlayer(data.defenderID);
                if (!defender) return ReturnTrigger.NO_EFFECT;
                let baseDamage = 0;
                if (damage > (defender.hp - defender.damage)) {
                    baseDamage = damage - (defender.hp - defender.damage);
                    let enemyBase: Base = game.players[defender.controllerID]?.base!;
                    enemyBase.damage += baseDamage;
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
                    return ReturnTrigger.NO_EFFECT;
                }
                // Ignore if the defender has sentinal
                if (defender.keywords.find(
                    (keyword: CardKeyword) => keyword.keyword == Keyword.SENTINAL
                )) {
                    return ReturnTrigger.NO_EFFECT;
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return ReturnTrigger.CANCEL;
                }
            }
        },
        {
            trigger: Trigger.CHECK_BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attackerID: CardID = data.attackerID;
                let attacker: CardActive = game.findUnitAnyPlayer(attackerID)!;
                let defenderPlayerID: PlayerID = data.defenderPlayerID;

                // Ignore if the defender and sentinal are different teams
                if (defenderPlayerID != thisCard.controllerID) {
                    return ReturnTrigger.NO_EFFECT;
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return ReturnTrigger.CANCEL;
                }
            }
        },
    ],
    [Keyword.AMBUSH]: [
        {
            trigger: Trigger.PLAY,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (game.getStep() == ExecutionStep.NONE) {
                    game.setStep(ExecutionStep.ABILITY_1);
                    return game.requestTargets(
                        TargetCount.ONE,
                        TargetType.UNIT,
                        thisCard.controllerID,
                        thisCard.cardUid,
                        "Select target for ambush"
                    );
                }
                if (game.getStep() == ExecutionStep.ABILITY_1) {
                    let target = game.getTarget_SingleCardID();
                    if (!target) return ReturnTrigger.NO_EFFECT;
                    thisCard.ready = true;
                    game.setStep(ExecutionStep.ABILITY_2);
                    game.nonActionAttackCard(thisCard.controllerID, thisCard.cardID, target);
                    return ReturnTrigger.UNFINISHED;
                }
                // if (game.getStep() == ExecutionStep.ABILITY_2) {
                //     // If attack was invalid, we have him be unready
                //     if (game.getChildOutput() == ReturnTrigger.CANCEL) {
                //         thisCard.ready = false
                //     }
                // }
                if (game.getStep() == ExecutionStep.ABILITY_2) {
                    // Loop back version to allow new target to be selected
                    if (game.getChildOutput() == ReturnTrigger.CANCEL) {
                        thisCard.ready = false;
                        game.setStep(ExecutionStep.NONE);
                        return ReturnTrigger.UNFINISHED;
                    }
                }
            }
        }
    ],
    [Keyword.GRIT]: [
        {
            trigger: Trigger.DAMAGE_CHANGES,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let buff: Buff = {
                    power: thisCard.damage,
                    hp: 0,
                    duration: EffectDuraction.DAMAGE_CHANGES,
                };
                game.applyBuff(thisCard, buff);
            }
        }
    ],
    [Keyword.HIDDEN]: [
        {
            trigger: Trigger.PLAY,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let cardID: CardID = data.cardID;
                if (cardID == thisCard.cardID) {
                    let buff: Buff = {
                        power: 0,
                        hp: 0,
                        duration: EffectDuraction.END_OF_PHASE,
                        keyword: {
                            keyword: Keyword.UNATTACKABLE,
                            number: 0
                        }
                    };
                    game.applyBuff(thisCard, buff);
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
                    return ReturnTrigger.CANCEL; // Cancel attack if attacking this unit
                }
            }
        },
    ],
    [Keyword.EXPLOIT]: [
        {
            trigger: Trigger.CALC_COST,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (thisCard.cardID != data.cardID) return ReturnTrigger.NO_EFFECT
                if (game.getStep() == ExecutionStep.NONE) {
                    game.setStep(ExecutionStep.ABILITY_1);
                    return game.requestTargets(
                        TargetCount.ANY,
                        TargetType.UNIT,
                        thisCard.controllerID,
                        thisCard.cardUid,
                        `Select up to ${number} targets for exploit`
                    );
                }
                if (game.getStep() == ExecutionStep.ABILITY_1) {
                    let targets = game.getTarget_CardList().filter((card: CardActive) => {
                        return card.controllerID == thisCard.controllerID
                    });
                    if (targets.length == 0) return ReturnTrigger.NO_EFFECT;
                    targets = targets.slice(0, number);
                    targets.forEach((card: CardActive) => {
                        game.defeatCard(card.cardID)
                        data.amount -= 2
                    })
                    return ReturnTrigger.ENDED;
                }
            }
        }
    ]

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
    ["5243634234"]: [
        { keyword: Keyword.EXPLOIT, number: 2}
    ]
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
            // give defender buff to deal damage post_attack
            trigger: Trigger.DEAL_DAMAGE,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                if (data.defenderID != data.dealerID) return
                // Don't block damage if marked by self (marked means he already blocked the damage earlier)
                if (thisCard.buffs.find((u: Buff) => u.abilityID == "4328408486_2")) return 
                let defender: CardActive = game.findUnitAnyPlayer(data.defenderID)!;
                let buff: Buff = {
                    power: 0,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                    abilityID: "4328408486",
                }
                game.applyBuff(defender, buff)
                let buff2: Buff = {
                    power: 0,
                    hp: 0,
                    duration: EffectDuraction.END_OF_ATTACK,
                    abilityID: "4328408486_2",
                }
                game.applyBuff(thisCard, buff2)
                return ReturnTrigger.CANCEL
            }
        }
    ],
    ["2657417747"]: [ // Quasar Tie Carrier
        {
            // Create Tie token on attack
            trigger: Trigger.UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                game.createTokenUnit(thisCard.controllerID, Token.TIE_FIGHTER)
                return ReturnTrigger.ENDED
            }
        },
        {
            // Create Tie token on attack
            trigger: Trigger.BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                game.createTokenUnit(thisCard.controllerID, Token.TIE_FIGHTER)
                return ReturnTrigger.ENDED
            }
        },
    ],
    ["2508430135"]: [ // Oggdo Bogdo
        {
            // Can't attack unless damaged
            trigger: Trigger.CHECK_UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                if (thisCard.damage <= 0) return ReturnTrigger.CANCEL
            }
        },
        {
            // Can't attack unless damaged
            trigger: Trigger.CHECK_BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                if (thisCard.damage <= 0) return ReturnTrigger.CANCEL
            }
        },
        {
            // Heal on kill
            trigger: Trigger.POST_UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                let defender: CardActive = game.findUnitAnyPlayer(data.defenderID)!;
                if (!defender) game.healDamage(thisCard.cardID, 2) // If can't find defender (they died), heal 2
                return ReturnTrigger.ENDED
            }
        },
        // {
        //     // Can't attack unless damaged
        //     trigger: Trigger.UNIT_ATTACK,
        //     effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
        //         if (data.attackerID != thisCard.cardID) return
        //         let defender: CardActive = game.findUnitAnyPlayer(data.defenderID)!;
        //         let buff: Buff = {
        //             power: 0, hp: 0,
        //             duration: EffectDuraction.END_OF_ATTACK,
        //             abilityID: "2508430135", // Heal on defeat
        //         }
        //         game.applyBuff(defender, buff)
        //     }
        // },
    ],
    ["7504035101"]: [ // Loth-Wolf
        {
            // Unit cannot attack
            trigger: Trigger.CHECK_UNIT_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.attackerID != thisCard.cardID) return
                return ReturnTrigger.CANCEL
            }
        },
    ],
}



export const BuffCardIDAbilities: {[key in CardUID]: Ability[]} = {
    ["4328408486"]: [ // Incinerator Trooper mechanics
        {
            // This buff allows for damage after the attack from the defender
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
    ["4328408486_2"]: [], // Incinerator Trooper marker to no longer block defender damage,
    // ["2508430135"]: [ // Oggdo Bogdo - Heal on defeat
    //     {
    //         trigger: Trigger.DEFEAT, // TEST CASE: Both units should die at same time, but could that change?
    //         effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
    //             if (data.cardID != thisCard.cardID) return
    //             let killer = game.findUnitAnyPlayer(data.killerID)
    //             if (killer) game.healDamage(killer?.cardID, 2) 
    //         }
    //     }
    // ],
}
