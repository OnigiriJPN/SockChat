const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// 静的ファイルを配信（HTMLやCSSが同じフォルダにある想定）
app.use(express.static(path.join(__dirname, '.')));

// 接続管理
wss.on('connection', (ws, req) => {
    // URLからルーム名を取得する（例: /?room=general）
    const urlParams = new URLSearchParams(req.url.replace('/?', ''));
    const room = urlParams.get('room') || 'general';
    ws.room = room;

    console.log(`ユーザーが参加しました [ルーム: ${room}]`);

    ws.on('message', (message) => {
        // 受け取ったメッセージを同じルームにいる全員にブロードキャスト
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN && client.room === ws.room) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        console.log(`ユーザーが退出しました [ルーム: ${room}]`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`SockChatサーバーがポート ${PORT} で起動中！`);
});
