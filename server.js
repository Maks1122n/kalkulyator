const express = require('express');
const path = require('path');
const compression = require('compression');

const app = express();
const port = process.env.PORT || 3000;

// Включаем сжатие gzip для оптимизации
app.use(compression());

// Настройка кэширования для статических файлов
app.use(express.static('.', {
    maxAge: '1d', // Кэш на 1 день
    etag: true,
    lastModified: true
}));

// Настройка безопасности headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Страница справки
app.get('/help', (req, res) => {
    res.sendFile(path.join(__dirname, 'help.html'));
});

// Страница политики конфиденциальности
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'privacy.html'));
});

// Манифест PWA
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(path.join(__dirname, 'manifest.json'));
});

// Обработка 404 ошибок
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Обработка ошибок сервера
app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).send('Что-то пошло не так!');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

const server = app.listen(port, () => {
    console.log(`🚀 Калькулятор запущен на порту ${port}`);
    console.log(`📱 Откройте http://localhost:${port} в браузере`);
}); 