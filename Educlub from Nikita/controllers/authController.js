// controllers/authController.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Регистрация пользователя
exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  User.getUserByEmail(email, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при проверке email' });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    User.createUser(name, email, password, role, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка при регистрации' });
      }
      res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
    });
  });
};

// Вход пользователя
exports.login = (req, res) => {
  const { email, password } = req.body;

  User.getUserByEmail(email, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка при проверке email' });
    }
    if (result.length === 0) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const user = result[0];

    // Сравниваем пароли
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка при проверке пароля' });
      }
      if (!isMatch) {
        return res.status(400).json({ message: 'Неверный пароль' });
      }

      // Создаем JWT
      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ message: 'Успешный вход', token });
    });
  });
};
