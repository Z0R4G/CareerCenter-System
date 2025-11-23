const express = require ('express');
const db = require('../configs/dbConnection');
const router = express.Router();
const { LoginUser,
        RegisterUser,
        loginCounselor,
        RegisterCounselor
} = require('../controllers/signupLoginController');

router.post('/register', RegisterUser);

router.post('/login',LoginUser);

router.post('/counselor/register', RegisterCounselor);

router.post('/counselor/login',loginCounselor);

module.exports = router;