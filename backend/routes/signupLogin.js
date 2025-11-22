const express = require ('express');
const db = require('../configs/dbConnection');
const router = express.Router();
const { LoginUser,
        RegisterUser
} = require('../controllers/signupLoginController');

router.post('/register', RegisterUser);

router.post('/login',LoginUser);

module.exports = router;