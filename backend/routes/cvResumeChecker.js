const express = require ('express');
const db = require('../dbConnection');
const router = express.Router();
const { 
    //functions tobe imported
 } = require('../controllers/CVResumeController');

//TODO: change routes accordingly
router.patch('/editUser', UpdateuserProfile);

module.exports = router;