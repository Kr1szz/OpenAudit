const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

class AuthService {
    static async register(userData) {
        const user = await User.create(userData);
        const token = this.generateToken(user);
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }

    static async login(email, password) {
        const user = await User.findByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await User.verifyPassword(password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        const token = this.generateToken(user);
        return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
    }

    static generateToken(user) {
        return jwt.sign(
            { id: user.id, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
    }

    static verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = AuthService;