const userController = require('../controllers/userController')
const express = require('express');
const router = express();

router.use(express.json());

const bodyParser  = require('body-parser');
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/mail-verification',userController.mailverification)
router.get('/reset-password',userController.resetPassword)
router.post('/reset-password',userController.updatePassword)
router.get('/reset-success',userController.resetSuccess)



module.exports = router;