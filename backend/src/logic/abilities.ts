import { Arena, Base, CardActive, CardUID, Game, PlayerID, PlayerState } from "../models/game";
import { GameClass } from "./gameClass";

export enum Trigger {
    /** After card is on the ground/space
     * 
     * Data: card
     */
    PLAY,
    DEFEAT,

    /** Before maybe attack takes place
     * 
     *  Data: attacker, defender
    */
    CHECK_UNIT_ATTACK,

    /** Before confirmed attack takes place
     * 
     *  Data: attacker, defender
    */
    UNIT_ATTACK,

    /** Before maybe base attack takes place
     * 
     *  Data: attacker, defender
    */
    CHECK_BASE_ATTACK,

    /** Before attack takes place
     * 
     *  Data: attacker, defenderPlayerID
    */
    BASE_ATTACK,

    /** Right before deal damage
     * 
     *  Data: dealer, attacker, defender, amount
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
     *  Data: card
    */
    DAMAGE_CHANGES,

    /** Calculating final cost of card
     * 
     *  Data: card, amount
     * 
     *  Update amount if data changes
    */
    CALC_COST,
    CARD_ENTER_LEAVE,
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

export interface Ability {
    trigger: Trigger,
    effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => boolean | void,
}

export interface Upgrade {
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
                let attacker: CardActive = data.attacker;
                if (attacker != thisCard) return;

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
                let attacker: CardActive = data.attacker;
                if (attacker != thisCard) return;

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
                let dealer: CardActive = data.dealer;
                let attacker: CardActive = data.dealer;
                if (dealer != thisCard) return;
                if (attacker != thisCard) return;

                let damage: number = data.damage;
                let defender: CardActive = data.defender;
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
                let attacker: CardActive = data.attacker;
                let defender: CardActive = data.defender;
                // Ignore if the defender and sentinal are different teams
                if (defender.controllerID != thisCard.controllerID) {
                    return false
                }
                // Ignore if the defender has sentinal
                if (defender.keywords.find(
                    (keyword: CardKeyword) => keyword.keyword == Keyword.SENTINAL
                )) {
                    return false
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return true
                }
            }
        },
        {
            trigger: Trigger.CHECK_BASE_ATTACK,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                let attacker: CardActive = data.attacker;
                let defenderPlayerID: PlayerID = data.defenderPlayerID
                
                // Ignore if the defender and sentinal are different teams
                if (defenderPlayerID != thisCard.controllerID) {
                    return false
                }
                // Cancel attack if the sentinal in the same arena as attacker
                if (thisCard.arena == attacker.arena) {
                    return true
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
                let card: CardActive = data.card;
                if (card == thisCard) {
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
                let defender: CardActive = data.defender;
                if (defender == thisCard) {
                    return true // Cancel attack if attacking this unit
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
}



export const CardIDAbilities: {[key in CardUID]: Ability[]} = {
    ["1087522061"]: [ // AT-DP Occupier
        {
            // Reduce cost by 1 for every damaged ground unit
            trigger: Trigger.CALC_COST,
            effect: (thisCard: CardActive, game: GameClass, data?: any, number?: number) => {
                if (data.card == thisCard) {
                    let cards = game.getEveryUnit()
                    for (let card of cards) {
                        if (card.damage > 0 && card.arena == Arena.GROUND)
                            data.amount -= 1
                    }
                }
            }
        }
    ],
}



export const UpgradeCardIDAbilities: {[key in CardUID]: Ability[]} = {

}
