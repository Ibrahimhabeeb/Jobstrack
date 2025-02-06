const Job = require('../models/Job')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const moment =  require('moment')
const mongoose = require('mongoose')
const getAllJobs = async (req, res) => {
const filterobj ={}
filterobj.createdBy = req.user.userId;
const {search, status, jobType, sort} = req.query
if (search) {
  filterobj.position = { $regex: search, $options: 'i' };
}
if(status && status !== 'all'){
  filterobj.status = status
}
if(jobType && jobType !== 'all'){
  filterobj.jobType = jobType
}
  let jobs =  Job.find(filterobj)
// console.log(jobs, sort)
 switch (sort) {
  case 'latest':
   jobs =  jobs.sort('-createdAt')
    break;
    case 'oldest':
    jobs =jobs.sort('createdAt')
    break;
    case 'a-z':
      jobs = jobs.sort('position')
      break;
      case 'z-a':
      jobs =jobs.sort('-position')
      break;
    default:
    jobs  = jobs.sort ('createdAt')
    break; 
  }


  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  jobs = jobs.skip(skip).limit(limit);

  jobs = await jobs
  const totalJobs = await Job.countDocuments(filterobj);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
}
const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
}

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty')
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  )
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).json({ job })
}

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req

  const job = await Job.findByIdAndDelete({
    _id: jobId,
    createdBy: userId,
  })
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`)
  }
  res.status(StatusCodes.OK).send()
}
const getstats = async(req,res)=>{
  console.log(req.user)
   const pipeline = [
    {
      $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) }
   },
   // Stage 2: Group remaining documents by pizza name and calculate total quantity
   {
      $group: { _id: "$status", totalQuantity: { $sum: 1 } }
   }
   ]
   let stats =  await Job.aggregate(pipeline)
  //  console.log(stats)
let defaultStats =stats.reduce((acc,each)=>{
  acc[each._id] = each.totalQuantity || 0
  return acc;

}, {})

const monthpipeline = [
  {
    $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) }
  },
  {
    $group:{
      _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
      totalQuantity: {$sum:1}
    },
  },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
]


let monthlyApplications = await Job.aggregate(monthpipeline);
monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        totalQuantity,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, totalQuantity };
    })
    .reverse();
    console.log(monthlyApplications)

   res.status(200).json({defaultStats, monthlyApplications})
    
}

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  getstats
}
