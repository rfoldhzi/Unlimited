import { Arena, Aspect, Base, CardActive, CardUID, Game, games, Leader, Phase, PlayerState, SubPhase } from "../models/game"
import { CardIDKeywords } from "./abilities";
const https = require('https');

let deckCodes = [
    "U2FsdGVkX1+wDBJsH2FMDcjgFeTWDZUrf8TcGdQiRT278TOgd1LYr6FqUaxI+ZhTPel7DJDJK/iMYLyS0IY6K+beaeJEF3/A2BYhqKpnURX0FMD+Luzb8xCh6O77mc1rc8D6qffkMPD2AHxTKr4l76ttEoepfrRpHRpzCfHlCU08nX/CYOvvwMMhAsi6YeP1E9KwEzP120YMcyp4xczyNxcGKJwKKSJ/N+RBl2YZYVcG2R34OxEBnQpYxibLDZ4UWNu4bEdOX2qqXYbm4XG8gMiDssrz3fOV9FQm0rWo1p38917pnMhYgKMGOyJQSW5F",
    "U2FsdGVkX1/SRuccWp65qiVOVoN0zA05HGMMU4ReY72AJwZ7KzagONJsZaG++40YIjd6+XWQQhH0lmZeTOQRVP5sANOR4VMsKZrNGf2RUeRXY1aPJUvLXBUnya4C+0C5l7FoyE5pSG0/Skj6qtObBRi1gQD9/d9yumHiGBzDXZ/22GVeXFpxDWJaOWoamUyTAWvKJAr6iloX9M34bexLsRztTux/7zturL5TUKQ3MiFcDULc8eXvd5aFhbJ5F37cI6rLDoypGTcw5viICbMTmud6gDRYDUdSGi2GHROLTP458sbUk70azdnbAt5ofTLNcbGz3AtgZQzhh7H/9Z713xzqxXZThWnv/n/x3AjOppDabvxUyACn9/39mHXudltO",
]

async function fetchDeck(code: string) {
    let result = await new Promise((resolve, reject) => {
        let dataString = `{"code":"${code}"}`
        let headers = {
            'Content-Type': 'text/plain'
        };
        const options = {
            hostname: 'starwarsunlimited.com',
            path: '/api/deck-decode',
            method: 'POST',
            headers: headers,
            // body: dataString
        };
        console.log("promsie1")
        const req = https.request(options, (res: any) => {
            console.log("res1")

            let output = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk: any) {
                output += chunk;
            });

            res.on('end', () => {
                try {
                    let obj = JSON.parse(output);
                    console.log('rest::', obj);
                    resolve({
                        statusCode: res.statusCode,
                        data: obj
                    });
                }
                catch (err) {
                    console.error('rest::end', err);
                    // reject(err);
                }
            });
        })

        let deckCode = deckCodes[Math.floor(Math.random() * deckCodes.length)];
        req.write(`{"code":"${deckCode}"}`);
        req.end();

    })
    return result
}

function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export async function importDeck(code: string, player: PlayerState, randomize?: boolean) {
    
    console.log("deck1")
    let data: any = await fetchDeck(code)
    data = data.data.deck
    let deck: CardUID[] = []
    console.log("deck",data)
    data.resources.forEach((element: any) => {
        for (let i=0; i < element.count; i++) {
            deck.push(element.cardId)
        }
    });
    if (randomize) {
        shuffleArray(deck)
    }
    let base: Base = {
        cardUid: data.base.cardId,
        aspect: data.base.card.aspects.map((item: any) => item.name)[0],
        hp: data.base.card.hp,
        damage: 0,
    }
    let leaders: Leader[] = data.leaders.map((item: any) => {
        let leader: Leader = {
            cardUid: item.cardId,
            aspects: item.card.aspects.map((item: any) => item.name),
            ready: true,
            epicActionAvailable: true,
            deployed: false
        }
        return  leader
    })
    console.log("player",player);
    console.log("deck",deck);
    console.log("leaders",deck);

    player.deck = deck;
    player.base = base;
    player.leaders = leaders;
}

export async function fetchCard(cardUid: CardUID) {
    console.log("anything")
    let result = await new Promise((resolve, reject) => {
        https.get(`https://admin.starwarsunlimited.com/api/card/${cardUid}`, (res: any) => {
            let output = '';
            res.setEncoding('utf8');

            res.on('data', function (chunk: any) {
                output += chunk;
            });

            res.on('end', () => {
                try {
                    let obj = JSON.parse(output);
                    // console.log('rest::', obj);
                    resolve({
                        statusCode: res.statusCode,
                        data: obj
                    });
                }
                catch (err) {
                    console.error('rest::end', err);
                    // reject(err);
                }
            });
        })

    })
    return result

}

export enum Token {
    TIE_FIGHTER = "TIE FIGHTER",
    X_WING = "X-WING",
    BATTLE_DROID = "BATTLE DROID",
    CLONE_TROOPER = "CLONE TROOPER",
}

export const TokenUnit: {[key in Token]: CardActive} = {
    [Token.TIE_FIGHTER]: {
        cardID: 0,
        cardUid: "7268926664",
        name: "Tie Fighter",
        hp: 1,
        power: 1,
        cost: 0,
        aspectCost: [Aspect.VILLANY],
        ownerID: "",
        damage: 0,
        ready: false,
        imgURL: "https://starwarsunlimited.com/_next/image?url=https%3A%2F%2Fcdn.starwarsunlimited.com%2F%2F04010_T01_EN_TIE_Fighter_797390e528.png&w=1200&q=75",
        controllerID: "0",
        buffs: [],
        keywords: [],
        arena: Arena.SPACE,
    },
    [Token.X_WING]: {
        cardID: 0,
        cardUid: "9415311381",
        name: "X-Wing",
        hp: 2,
        power: 2,
        cost: 0,
        aspectCost: [Aspect.HEROISM],
        ownerID: "",
        damage: 0,
        ready: false,
        imgURL: "https://starwarsunlimited.com/_next/image?url=https%3A%2F%2Fcdn.starwarsunlimited.com%2F%2F04010_T02_EN_X_Wing_23535e05f0.png&w=1200&q=75",
        controllerID: "0",
        buffs: [],
        keywords: [],
        arena: Arena.SPACE,
    },
    [Token.BATTLE_DROID]: {
        cardID: 0,
        cardUid: "3463348370",
        name: "Battle Droid",
        hp: 1,
        power: 1,
        cost: 0,
        aspectCost: [Aspect.VILLANY],
        ownerID: "",
        damage: 0,
        ready: false,
        imgURL: "https://starwarsunlimited.com/_next/image?url=https%3A%2F%2Fcdn.starwarsunlimited.com%2F%2F0301_T01_EN_Battle_Droid_f1580df691.png&w=1200&q=75",
        controllerID: "0",
        buffs: [],
        keywords: [],
        arena: Arena.SPACE,
    },
    [Token.CLONE_TROOPER]: {
        cardID: 0,
        cardUid: "3941784506",
        name: "Clone Trooper",
        hp: 2,
        power: 2,
        cost: 0,
        aspectCost: [Aspect.HEROISM],
        ownerID: "",
        damage: 0,
        ready: false,
        imgURL: "https://starwarsunlimited.com/_next/image?url=https%3A%2F%2Fcdn.starwarsunlimited.com%2F%2F0301_T02_EN_Clone_Trooper_d915e8d856.png&w=1200&q=75",
        controllerID: "0",
        buffs: [],
        keywords: [],
        arena: Arena.SPACE,
    },
}

export async function createCard(cardUid: CardUID): Promise<CardActive | null> {
    let data: any = await fetchCard(cardUid)
    data = data.data.data
    // console.log("data",data)
    if (data == null) {
        console.log("Data is null...?")
        return null
    }
    let card: CardActive = {
        cardID: 0,
        cardUid: cardUid,
        name: data.attributes.title,
        hp: data.attributes.hp,
        power: data.attributes.power,
        cost: data.attributes.cost,
        aspectCost: data.attributes.aspects.data.map((item: any) => item.attributes.name),
        ownerID: "",
        damage: 0,
        ready: true,
        imgURL: data.attributes.artFront.data.attributes.formats.card.url,
        controllerID: "0",
        buffs: [],
        keywords: []
    }
    if (cardUid in CardIDKeywords) {
        for (let cardKeyword of CardIDKeywords[cardUid]!) {
            card.keywords.push(cardKeyword)
        }
    }
    if (data.attributes.arenas.data.find((item: any) => item.attributes.name == "Ground")) {
        card.arena = Arena.GROUND
    }
    if (data.attributes.arenas.data.find((item: any) => item.attributes.name == "Space")) {
        card.arena = Arena.SPACE
    }
    return card
}

export const createPlayer = (player: string): PlayerState => {
    let base: Base = {
        cardUid: "6093792814",
        aspect: Aspect.CUNNING,
        hp: 0,
        damage: 0
    }
    let player1: PlayerState = {
        playerID: player,
        base: base,
        leaders: [],
        hand: ["2383321298", "6867378216", "7227136692", "3347454174", "9655836052", "2151832252", "9127322562"],
        resources: [],
        deck: [],
        groundArena: [],
        spaceArena: [],
        discard: [],
        totalResources: 2,
        resourcesRemaining: 2,
        finished: false,
        cardsToResource: 0
    }
    return player1
}

export const createSampleGame = async (): Promise<Game> => {
    // console.log("HERE")
    // let card = await createCard(2383321298) // StormTrooper
    // let card2 = await createCard(6867378216) // Tie Fighter
    // console.log("card", card)
    let base: Base = {
        cardUid: "6093792814",
        aspect: Aspect.CUNNING,
        hp: 0,
        damage: 0
    }
    let player1: PlayerState = {
        playerID: "0",
        base: base,
        leaders: [],
        hand: ["2383321298", "6867378216", "7227136692", "3347454174", "9655836052", "2151832252", "9127322562"],
        resources: [],
        deck: [],
        groundArena: [],
        spaceArena: [],
        discard: [],
        totalResources: 2,
        resourcesRemaining: 2,
        finished: false,
        cardsToResource: 0
    }
    let game: Game = {
        gameID: 0,
        cardCount: 0,
        players: {
            "0": player1
        },
        name: "Cloud",
        initiative: "0",
        turn: "0",
        phase: Phase.ACTION,
        initiativeClaimed: false,
        subPhase: SubPhase.TURN,
        targets: [],
        playedCard: undefined,
        heap: [],
        stack: []
    }
    return game
}

export const sampleGame = async (newGame?: boolean, player?: string) => {
    // console.log("HERE2", games)
    if (games && games.length > 0 && !newGame) {
        // console.log("HERE3", games)
        if (player && !games[0]!.players[player]) {
            games[0]!.players[player] = createPlayer(player)
        }
        return games[0]
    }
    if (newGame) {
        (games as Game[]) = []
    }
    let game = await createSampleGame();
    
    (games as Game[]).push(game)

    if (player && !game.players[player]) {
        game.players[player] = createPlayer(player)
    }
    // console.log("game",game)

    return game 
}