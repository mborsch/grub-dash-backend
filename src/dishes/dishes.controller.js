const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res){
    res.json({ data: res.locals.dish });
}

function bodyDataHas(propertyName){
    function (req, res, next){
        const { data = {} } = req.body;
        if(data[propertyName]){
            return next();
        }
        next({
            status: 400,
            message: `Must include a ${propertyName}.`,
        })
    }
}

module.exports = {
  create: [],
  read: [],
  list,
  update: [],
}