// Модель пользователя для базы данных
// С помощью этой модели данные сохраняются в коллекцию users

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import uniqueValidator from 'mongoose-unique-validator';

// Схема модели пользователя
// Для проверки уникальности записи используется unique: true
const schema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true, unique: true },
    passwordHash: { type: String, required: true },
    confirmed: { type: Boolean, default: false },
    confirmationToken: { type: String, default: '' },
  },
  { timestamps: true }
);

// Метод проверки соответствия переданного пароля хэшу пароля пользователя
schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
}

// Создание и запись в модель хэша переданного пароля
schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
}

// Создание и запись в модель токена, необходимого для подтверждения email
schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
}

// Создание URL, по которому можно подтвердить email
schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
}

// Создание URL, по которому можно изменить пароль
schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  return `${process.env.HOST}/reset_password/${this.generateResetPasswordToken()}`;
}

// Генерация токена
schema.methods.generateJWT = function generateJWT() {
  return jwt.sign(
    {
      email: this.email,
      confirmed: this.confirmed,
    },
    process.env.JWT_SECRET
  );
}

// Генерация токена для изменения пароля
schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}


// Генерация объекта с данными пользователя, передаваемого пользователю от сервера при ответе
schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    confirmed: this.confirmed,
    token: this.generateJWT()
  }
}

// Плагин для проверки уникальности свойств модели
// При совпадении генерируется ошибка, в которую помещается сообщение message
schema.plugin(uniqueValidator, { message: 'This email is already taken' });

export default mongoose.model('User', schema);
