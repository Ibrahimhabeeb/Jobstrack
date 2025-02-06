const express = require('express')
const demouser = require('../middleware/authorizespec')
const router = express.Router()
const {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  getstats
} = require('../controllers/jobs')

router.route('/').post(createJob).get(getAllJobs)
router.route('/stats').get(getstats)
router.route('/:id').get(getJob).delete(demouser,deleteJob).patch(demouser, updateJob)

module.exports = router
