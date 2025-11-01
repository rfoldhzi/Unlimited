import express from 'express';
import itemRoutes from './routes/itemRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { importDeck, sampleGame } from './logic/gameHandler';
import { GameClass } from './logic/gameClass';

const app = express();

// WS
const server = require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server: server });

wss.on('connection', (ws: any) => {
    console.log('Client connected');

    ws.on('message', async (message: any) => {
        console.log(`Received: ${message}`, typeof message.toString());

        if (message == "GAME") {
            let game = await sampleGame()
            ws.send(JSON.stringify(game))
        } else if (message == "restart") {
            let game = await sampleGame(true)
            ws.send(JSON.stringify(game))
        } else {
            let split = message.toString().split(":")
            if (split[0] == "Play Card") {
                let player = split[1]!
                let cardUid = split[2]!

                let game = await sampleGame(false, player)
                console.log("game", game)
                let gameClass = new GameClass(game!)
                console.log("app1")
                await gameClass.playCard(cardUid, player)
                console.log("app2")
                console.log("game2", game)
                console.log("game2.hand", game!.players['0']!.hand)
                console.log("gameClass", gameClass)
                console.log("gameClass.hand", gameClass!.players['0']!.hand)
                ws.send(JSON.stringify(gameClass))
            } else if (split[0] == "import deck") {
                let player = split[1]!
                let game = await sampleGame(false, player)

                game!.players[player]!.deck = (await importDeck("", true))!
                game!.players[player]!.hand = []
                let gameClass = new GameClass(game!)
                for (let i=0; i<6; i++) {
                    gameClass.drawCard(player)
                }
                ws.send(JSON.stringify(gameClass))
            } else if (split[0] == "Draw Card") {
                let player = split[1]!
                
                let game = await sampleGame(false, player)
                let gameClass = new GameClass(game!)
                await gameClass.drawCard(player)
                ws.send(JSON.stringify(gameClass))
            } else {
                // Echo message back to the client
                ws.send(`Server received: ${message}`);
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });

    ws.on('error', (error: any) => {
        console.error('WebSocket error:', error);
    });
});

server.listen(9000, () => console.log(`Lisening on port :7000`))

// END of WS

app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;