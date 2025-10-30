import { Arena, CardActive, CardUID, Game, games, PlayerState } from "../models/game"
const https = require('https');

let deckCode = "U2FsdGVkX18MXyRr/j5zacb6LjmsLpjpSpejheIax2KNmzVL0LAW0so+acubQrt9V3mbBrLwrsYE7akB4rJBgFdIj2Rnm7jZ5iqrz7BGDvwYf7Ms/CMW+NduAiRSTEWZhrmC/iGteScoq0snlU57jhhxcuZcuLuBeLrEGX+40hOMVW5J0AhpIF7KVYHQ/WDj4C3TYVJ/TZa8RIBN5wMP+UezTA9dFSM0uE4HwCFcDkDizHh3Vdwrt8mGxGIErF/egJdeasllAfWTJeCFPH48GZoWbffkJTQNsYA4ch6MGHAjOXGLC2Xi7h5spDaj2fw5"

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

        req.write('{"code":"U2FsdGVkX18MXyRr/j5zacb6LjmsLpjpSpejheIax2KNmzVL0LAW0so+acubQrt9V3mbBrLwrsYE7akB4rJBgFdIj2Rnm7jZ5iqrz7BGDvwYf7Ms/CMW+NduAiRSTEWZhrmC/iGteScoq0snlU57jhhxcuZcuLuBeLrEGX+40hOMVW5J0AhpIF7KVYHQ/WDj4C3TYVJ/TZa8RIBN5wMP+UezTA9dFSM0uE4HwCFcDkDizHh3Vdwrt8mGxGIErF/egJdeasllAfWTJeCFPH48GZoWbffkJTQNsYA4ch6MGHAjOXGLC2Xi7h5spDaj2fw5"}');
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

export async function importDeck(code: string, randomize?: boolean): Promise<CardUID[]> {
    
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
    return deck
}

async function fetchCard(cardUid: CardUID) {
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

export async function createCard(cardUid: CardUID): Promise<CardActive | null> {
    let data: any = await fetchCard(cardUid)
    data = data.data.data
    console.log("data",data)
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
    // console.log("HERE")
    // let card = await createCard(2383321298) // StormTrooper
    // let card2 = await createCard(6867378216) // Tie Fighter
    // console.log("card", card)
    let player1: PlayerState = {
        playerID: "0",
        hand: ["2383321298", "6867378216", "7227136692", "3347454174", "9655836052", "2151832252", "9127322562"],
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
    // console.log("HERE2", games)
    if (games && games.length > 0 && !newGame) {
        // console.log("HERE3", games)
        return games[0]
    }
    if (newGame) {
        (games as Game[]) = []
    }
    let game = await createSampleGame();
    
    (games as Game[]).push(game)
    // console.log("game",game)

    return game 
}