const express = require ('express');
const db = require('../configs/dbConnection');
const router = express.Router();
const { UpdateuserProfile } = require('../controllers/editProfileController');


router.patch('/editUser', UpdateuserProfile);

module.exports = router;