const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required(),
});

/* CRUD */

async function read(req, res) {
  const users = await getUsers(req.query.orderBy);
  res.send(users);
}

async function create(req, res) {
  // validate
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ message: error.details[0].message });
  } else {
    // check email (exists)
    const exists = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (exists) {
      res.status(409).send({ message: "user already exists" });
    } else {
      // create user
      const user = await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        },
      });
      // success ?
      if (user) {
        console.log(user);
        res.status(201).send(user);
      } else {
        res.status(400).send({
          message: "Error",
        });
      }
    }
  }
}

async function update(req, res) {
  const exists = await prisma.user.findFirst({ where: { id: req.body.id } });
  if (exists) {
    const user = await prisma.user.update({
      where: {
        id: req.body.id,
      },
      data: req.body,
    });

    res.send(user);
  } else {
    res.status(400).send({ message: "user does not exist" });
  }
}

async function del(req, res) {
  const exists = await prisma.user.findFirst({ where: { id: req.body.id } });
  if (exists) {
    await prisma.user.delete({
      where: {
        id: req.body.id,
      },
    });
    res.send();
  } else {
    res.status(400).send({ message: "user does not exits" });
  }
}

module.exports = {
  create,
  read,
  update,
  del,
};

/* HELPERS */

async function getUsers(query) {
  const selects = {
    id: true,
    name: true,
    email: true,
    created_at: true,
    updated_at: true,
    post: true,
  };

  let users = [];

  switch (query) {
    case "A-Z":
      users = await prisma.user.findMany({
        orderBy: {
          name: "asc",
        },
        select: selects,
      });
      break;
    case "Z-A":
      users = await prisma.user.findMany({
        orderBy: {
          name: "desc",
        },
        select: selects,
      });
      break;
    default:
      users = await prisma.user.findMany({
        orderBy: {
          created_at: "desc",
        },
        select: selects,
      });
  }

  return users;
}
