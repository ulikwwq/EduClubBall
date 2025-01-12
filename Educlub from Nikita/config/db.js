// config/db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost', // Адрес базы данных
  user: 'root',      // Имя пользователя
  password: '',      // Пароль
  database: 'educlub' // Имя базы данных
});

db.connect(err => {
  if (err) {
    console.error('Ошибка при подключении к базе данных: ', err);
  } else {
    console.log('Подключение к базе данных установлено');
  }
});

module.exports = db;
