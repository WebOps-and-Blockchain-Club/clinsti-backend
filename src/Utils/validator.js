const Joi = require('joi')

const {isLatitude, isLongitude} = require('class-validator')

const locationSchema = Joi.object({
    lat: Joi.custom((value, helpers) =>{
        if (!isLatitude(value)) return helpers.message('invalid Latitude')
        return value
    }),
    lon: Joi.custom((value, helpers) =>{
        if (!isLongitude(value)) return helpers.message('invalid Longitude')
        return value
    }),
})

const bloodTypeConstraint = Joi.valid("O+", "O-", "B+", "B-", "A+", "A-", "AB+", "AB-")

requestBodyConstraints = {

    email: Joi.string().email(),

    timeLimit: Joi.string().isoDate(),

    distance: Joi.number().integer().min(1000).max(50000),

    location: locationSchema,

    description: Joi.string().max(300)
}



function validator (reqKeys, optKeys) {
    return function(req, res, next){
        let constraint = {}

        for(const index in reqKeys){
            key = reqKeys[index]
            constraint[key] = requestBodyConstraints[key].required()
        }

        for(const index in optKeys){
            key = optKeys[index]
            constraint[key] = requestBodyConstraints[key]
        }

        const {value, error} = Joi.object(constraint).validate(req.body)

        if (error){
            return res.status(400).send(error.message)
        }
        next()
    }
}

/*
// TEST VALIDATOR

var req =
{
    body :{
    location: {lat:10, lon: 2},
    contactNo: '99111',
    }
}
var res = {
    status (val){
        console.log(val)
        return this
    },
    send (val){
        console.log(val)
        return this
    }
}

validator(['location'],['contactNo'])(req, res, ()=>{console.log("Valid")})

*/

module.exports = validator;