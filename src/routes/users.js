import { Router } from 'express';

// Models
import User from '../models/User';

// Парсер объекта ошибок
import parseErrors from '../utils/parseErrors';

// Модуль для отправки email
import { sendConfirmationEmail } from '../mailer';

let router = Router();

router.post('/', (req, res) => {
  const { email, password } = req.body.user;
  const user = new User({ email });
  user.setPassword(password);
  user.setConfirmationToken();
  user.save()
    .then(userRecord => {
      sendConfirmationEmail(userRecord);
      res.json({ user: userRecord.toAuthJSON() })
    })
    .catch(err => res.status(400).json({ errors: parseErrors(err.errors) }));
});

export default router;
