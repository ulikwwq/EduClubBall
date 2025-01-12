require('dotenv').config(); // для чтения данных из .env файла
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // для разрешения CORS
const path = require('path'); // Для работы с путями файлов
const twilio = require('twilio'); // для работы с Twilio API
const app = express();
const port = 5000;

// Настройка CORS
app.use(cors());

// Middleware для обработки JSON
app.use(express.json());

// Обслуживание статических файлов из папки "pages" и "styles"
app.use(express.static(path.join(__dirname, 'pages')));
app.use(express.static(path.join(__dirname, 'styles')));

// Создание подключения к базе данных
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Проверка подключения
connection.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    return;
  }
  console.log('Подключение к базе данных успешно!');
});

// Роут для отображения главной страницы (index.html)
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'index.html'));
});

// Роут для отображения страницы регистрации (register.html)
app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'register.html'));
});

// Роут для регистрации
app.post('/register', async (req, res) => {
  const { name, email, password, role, confirmPassword } = req.body;

  if (!name || !email || !password || !role || !confirmPassword) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Пароли не совпадают.' });
  }

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при проверке email' });
    }
    if (results.length > 0) {
      return res.status(400).json({ message: 'Email уже используется' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertQuery = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
    connection.query(insertQuery, [name, email, hashedPassword, role || 'student'], (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка при регистрации' });
      }

      res.status(200).json({ message: 'Регистрация успешна', redirectTo: '/index.html' });
    });
  });
});

// Роут для логина
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при проверке email' });
    }
    if (results.length === 0) {
      return res.status(400).json({ message: 'Пользователь с таким email не найден' });
    }

    const user = results[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Логин успешен', token, redirectTo: '/index.html' });
  });
});

// Роут для добавления группы
app.post('/add-group', (req, res) => {
  const { name, trainerId } = req.body;

  if (!name || !trainerId) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  const insertGroupQuery = 'INSERT INTO groups (name, trainer_id) VALUES (?, ?)';
  connection.query(insertGroupQuery, [name, trainerId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при добавлении группы' });
    }

    res.status(200).json({ message: 'Группа успешно добавлена' });
  });
});

// Роут для отправки сообщения через WhatsApp
app.post('/send-message', (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ message: 'Номер телефона и сообщение обязательны' });
  }

  // Настройка Twilio API
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `whatsapp:${phoneNumber}`,
    })
    .then(message => {
      res.status(200).json({ message: 'Сообщение отправлено', sid: message.sid });
    })
    .catch(err => {
      res.status(500).json({ message: 'Ошибка при отправке сообщения', error: err });
    });
});

// Роут для получения списка учеников и их родителей
app.get('/students-parents', (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ message: 'Не указан ID группы' });
  }

  const query = `
    SELECT s.name AS student_name, p.phone_number AS parent_phone_number
    FROM students s
    JOIN parents p ON s.id = p.student_id
    WHERE s.group_id = ?
  `;
  connection.query(query, [groupId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при получении данных' });
    }

    res.status(200).json(results);
  });
});

// Роут для добавления посещаемости
app.post('/attendance', (req, res) => {
  const { studentId, groupId, date, status } = req.body;

  if (!studentId || !groupId || !date || !status) {
    return res.status(400).json({ message: 'Пожалуйста, заполните все поля.' });
  }

  const insertAttendanceQuery = 'INSERT INTO attendance (student_id, group_id, date, status) VALUES (?, ?, ?, ?)';
  connection.query(insertAttendanceQuery, [studentId, groupId, date, status], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при добавлении посещаемости' });
    }

    res.status(200).json({ message: 'Посещаемость успешно добавлена' });
  });
});

// Роут для получения информации о посещаемости и оплатах
app.get('/attendance-info', (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ message: 'Не указан ID группы' });
  }

  const query = `
    SELECT s.name AS student_name, 
           COUNT(a.status = 'absent' OR NULL) AS absences,
           SUM(p.amount) AS total_paid
    FROM students s
    LEFT JOIN attendance a ON s.id = a.student_id AND a.group_id = ?
    LEFT JOIN payments p ON s.id = p.student_id
    GROUP BY s.id
  `;
  connection.query(query, [groupId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при получении данных' });
    }

    res.status(200).json(results);
  });
});

// Роут для получения информации о платежах учеников
app.get('/payments-info', (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ message: 'Не указан ID группы' });
  }

  const query = `
    SELECT s.name AS student_name, 
           p.amount AS paid_amount,
           p.payment_type AS payment_type,
           p.hours_worked AS hours_worked,
           COUNT(a.status = 'absent' OR NULL) AS absences
    FROM students s
    LEFT JOIN payments p ON s.id = p.student_id
    LEFT JOIN attendance a ON s.id = a.student_id AND a.group_id = ?
    WHERE p.group_id = ?
    GROUP BY s.id
  `;
  connection.query(query, [groupId, groupId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при получении данных о платежах' });
    }

    res.status(200).json(results);
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
