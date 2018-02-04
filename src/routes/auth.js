// Маршрут /api/auth

import { Router } from 'express';
// Модель коллекции users
import User from '../models/User';

let router = Router();

// Маршрут входа на сайт
router.post('/', (req, res) => {
  const { credentials } = req.body;
  User.findOne({ email: credentials.email }).then(user => {
    if (user && user.isValidPassword(credentials.password)) {
      res.json({ user: user.toAuthJSON() });
    } else {
      res.status(400).json({ errors: { global: "Invalid credentials" } });
    }
  });
});

// Маршрут подтверждения email
// Пока email не подтвержден, в записи пользователя в БД в свойстве confirmationToken хранится токен подтверждения,
// который передаётся при подтверждении от клиента
// При удачном подтверждении в это поле записывается пустая строка, так что повторное подтверждение невозможно,
// а клиенту будет передан пустой объект с ошибкой 400
router.post('/confirmation', (req, res) => {
  const token = req.body.token;
  User.findOneAndUpdate(
    {confirmationToken: token },
    { confirmationToken: '', confirmed: true },
    { new: true },
  ).then(user =>
    user ? res.json({ user: user.toAuthJSON() }) : res.status(400).json({})
  );
});

export default router;
