// Подключаем библиотеку веб-сокетов
const { WebSocketServer } = require('ws');

// Render.com автоматически выдает порт через process.env.PORT. 
// Если его нет (например, запуск на ПК), берется порт 10000.
const PORT = process.env.PORT || 10000;

// Запускаем WebSocket-сервер
const wss = new WebSocketServer({ port: PORT });

console.log(`Игровой сервер успешно запущен на порту ${PORT}`);

// Массив для хранения активных подключений (игроков)
let activePlayers = [];

wss.on('connection', (ws) => {
    console.log('Новый телефон подключился к игре!');
    activePlayers.push(ws);

    // Слушаем координаты от Godot
    ws.on('message', (message) => {
        const dataString = message.toString();

        // Пересылаем эти координаты ВСЕМ остальным игрокам в комнате
        activePlayers.forEach((player) => {
            if (player !== ws && player.readyState === ws.OPEN) {
                player.send(dataString);
            }
        });
    });

    // Очищаем список, если кто-то вышел
    ws.on('close', () => {
        console.log('Игрок отключился от сервера.');
        activePlayers = activePlayers.filter((player) => player !== ws);
    });

    // Защита от падения сервера при обрыве связи
    ws.on('error', (error) => {
        console.error('Ошибка сокета:', error);
    });
});
