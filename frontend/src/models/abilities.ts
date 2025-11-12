import type { CardUID } from "./game.ts";

export enum Trigger {
    PLAY,
    DEFEAT,

    /** Before attack takes place
     * 
     *  Data: attacker, defender
    */
    UNIT_ATTACK,

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
    CALC_COST,
    CARD_ENTER_LEAVE,
}   

export enum EffectDuraction {
    END_OF_ATTACK,
    END_OF_PHASE,
    CARD_ENTER_LEAVE,
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

export interface Upgrade {
    power: number,
    hp: number,
    duration: EffectDuraction,
    abilityID?: CardUID,
    keyword?: CardKeyword,
}

export interface CardKeyword {
    keyword: Keyword,
    number: number,
}


export interface Upgrade {
    power: number,
    hp: number,
    duration: EffectDuraction,
    abilityID?: CardUID,
}