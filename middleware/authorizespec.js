const BadrequestError = require('../errors/bad-request');

const demouser = (req, res, next)=>{
    const {testUser} = req.user
    if(testUser){
        throw new BadrequestError('Unauthorized to modify')
    }
    next();

}

module.exports = demouser