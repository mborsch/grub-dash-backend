const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: dishes });
}

//checks if name property is included or empty
function namePropertyValidator(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name && name !== "") {
    return next();
  }
  next({
    status: 400,
    message: `Must include a name property: ${name}`,
  });
}

//checks if description is included or empty
function descriptionPropertyValidator(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description && description !== "") {
    return next();
  }
  next({
    status: 400,
    message: `Must include a description property: ${description}`,
  });
}

//checks if image_url is included or empty
function image_urlPropertyValidator(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url && image_url !== "") {
    return next();
  }
  next({
    status: 400,
    message: `Must include a image_url property: ${image_url}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.dish });
}

//checks if dish exists
function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}.`,
  });
}

//ensures price property is a number and greater than 0
function pricePropertyIsValid(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: `price`,
    });
  }
  next();
}

//checks that both id's match
function idMatch(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;
  if (!id) {
    next();
  }
  if (dishId === id) {
    next();
  }
  next({
    status: 400,
    message: `dishId: ${dishId} does not match id: ${id}`,
  });
}

//creates a new dish
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//updates an existing dish without updating id
function update(req, res) {
  const dish = res.locals.dish;
  const { data: { name, description, price, image_url } = {} } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    pricePropertyIsValid,
    namePropertyValidator,
    descriptionPropertyValidator,
    image_urlPropertyValidator,
    create,
  ],
  read: [dishExists, read],

  update: [
    dishExists,
    pricePropertyIsValid,
    namePropertyValidator,
    descriptionPropertyValidator,
    image_urlPropertyValidator,
    idMatch,
    update,
  ],
};
