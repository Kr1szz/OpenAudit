const AuthService = require('../services/authService');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        console.log(name);
        const result = await AuthService.register({ name, email, password, role });
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await AuthService.login(email, password);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { register, login, getProfile };