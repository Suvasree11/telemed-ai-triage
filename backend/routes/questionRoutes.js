const router = require('express').Router();
const auth = require('../middleware/authMiddleware');
const {askQuestion,getAll,generatePrescription} = require('../controllers/questionController');

router.post('/', askQuestion);
router.get('/', auth, getAll);
router.post('/prescription', generatePrescription);

module.exports = router;