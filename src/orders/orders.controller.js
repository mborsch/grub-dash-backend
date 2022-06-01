const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({ data: orders });
}

function bodyDataHas(propertyName) {
  return function (req, res, next) {
    const { data = {} } = req.body;
    if (data[propertyName]) {
      return next();
    }
    next({
      status: 400,
      message: `Must include a ${propertyName}.`,
    });
  };
}

function isArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes)) {
    return next();
  }
  next({
    status: 400,
    message: `dishes must be an array`,
  });
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function create(req, res) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function statusSyntaxValidation(req, res, next) {
  const { data: { status } = {} } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  if (validStatus.includes(status)) {
    return next();
  }
  next({
    status: 400,
    message: `status requires a valid syntax`,
  });
}

function isDelivered(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "delivered") {
    return next({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  }
  next();
}

function dishValidator(req, res, next) {
  const { data: { dishes } = {} } = req.body;

  if (!Array.isArray(dishes)) {
    return next({
      status: 400,
      message: `dish must be array: ${dishes}`,
    });
  }
  if (dishes == [] || dishes == "") {
    return next({
      status: 400,
      message: `dish cannot be empty ${dishes}`,
    });
  }
  dishes.forEach((dish, index) => {
    if (!dish.quantity) {
      return next({
        status: 400,
        message: `quantity: ${index} ${dish.quantity}`,
      });
    }
    if (dish.quantity === undefined) {
      return next({
        status: 400,
        message: `quantity is undefined: ${dish.quantity}`,
      });
    }
    if (!Number.isFinite(dish.quantity)) {
      return next({
        status: 400,
        message: `quantity is not an integer: ${index} ${dish.quantity}`,
      });
    }
  });
  next();
}

function idMatch(req, res, next) {
  const { orderId } = req.params;

  const { data: { id } = {} } = req.body;
  if (!id) {
    return next();
  }
  if (orderId === id) {
    return next();
  }

  next({
    status: 400,
    message: `orderId: ${orderId} does not match id: ${id}`,
  });
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = dishes;

  res.json({ data: order });
}

function destroy(req, res, next) {
  const order = res.locals.order;
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId);
  if (index > -1 && order.status === "pending") {
    orders.splice(index, 1);
  } else {
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });
  }
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [orderExists, read],
  create: [
    dishValidator,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    isArray,
    create,
  ],
  update: [
    orderExists,

    bodyDataHas("mobileNumber"),
    bodyDataHas("status"),
    bodyDataHas("dishes"),
    bodyDataHas("deliverTo"),
    dishValidator,
    statusSyntaxValidation,
    isDelivered,
    idMatch,

    update,
  ],
  orderExists,
  delete: [orderExists, destroy],
};
