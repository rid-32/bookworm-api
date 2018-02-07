import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
// bodyParset парсит приходящие от клиента пост запросом данные
import bodyParser from 'body-parser';
// dotenv парсит файл .env и значениями из этого файла заполняет process.env
import dotenv from 'dotenv';
// Promis-библиотека для работы с mongoose
import Promise from 'bluebird';

// Routes
import auth from './routes/auth';
import users from './routes/users';
import books from './routes/books';

// Парсим файл .env и заполняем process.evn
dotenv.config();

const app = express();

// Определяем Promis для mongoose
mongoose.Promise = Promise;
// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URL);
let db = mongoose.connection;
db.on('open', () => console.log('We`re connected to the batabase: bookworm'));
db.on('error', () => console.log('Something wrong!'));

// Парсить json-данные, приходящие от клиента
app.use(bodyParser.json());
// Пользовательские маршруты
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/books', books);

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(8080, () => console.log('Server started on port: 8080'));
