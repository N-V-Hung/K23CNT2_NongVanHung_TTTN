import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(payload, expiresIn = null) {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: expiresIn || env.jwt.expiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, env.jwt.secret);
}