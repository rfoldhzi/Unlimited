import { Arena, CardActive, Game, games, PlayerState } from "../models/game"
const https = require('https');

async function fetchCard(cardUid: number) {
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

export async function createCard(cardUid: number): Promise<CardActive> {
    let data: any = await fetchCard(cardUid)
    data = data.data.data
    console.log("data",data)
    let card: CardActive = {
        cardID: 0,
        cardUid: cardUid,
        name: data.attributes.title,
        hp: data.attributes.hp,
        power: data.attributes.power,
        cost: data.attributes.cost,
        aspectCost: [],
        ownerID: "",
        damage: 0,
        ready: true,
        imgURL: data.attributes.artFront.data.attributes.formats.card.url
    }
    if (data.attributes.arenas.data.find((item: any) => item.attributes.name == "Ground")) {
        card.arena = Arena.GROUND
    }
    if (data.attributes.arenas.data.find((item: any) => item.attributes.name == "Space")) {
        card.arena = Arena.SPACE
    }
    return card
}

export const createSampleGame = async (): Promise<Game> => {
    console.log("HERE")
    // let card = await createCard(2383321298) // StormTrooper
    // let card2 = await createCard(6867378216) // Tie Fighter
    // console.log("card", card)
    let player1: PlayerState = {
        playerID: "0",
        hand: [2383321298, 6867378216, 7227136692, 3347454174, 9655836052, 2151832252, 9127322562],
        resources: [],
        deck: [],
        leader: [],
        groundArena: [],
        spaceArena: [],
        discard: []
    }
    let game: Game = {
        gameID: 0,
        players: {
            "0":player1
        },
        name: "Cloud",
        initiative: "0",
    }
    return game
}

export const sampleGame = async (newGame?: boolean) => {
    console.log("HERE2", games)
    if (games && games.length > 0 && !newGame) {
        console.log("HERE3", games)
        return games[0]
    }
    if (newGame) {
        (games as Game[]) = []
    }
    let game = await createSampleGame();
    
    (games as Game[]).push(game)
    console.log("game",game)

    return game 
}