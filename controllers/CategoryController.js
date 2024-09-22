const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string().required(),
});

/* CRUD */

async function read(req, res) {
  const categories = await getCategory(req.query.orderBy);
  res.send(categories);
}

async function create(req, res) {
  // validate
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ message: error.details[0].message });
  } else {
    // check category (exists)
    const exists = await prisma.category.findFirst({
      where: {
        name: req.body.name,
      },
    });
    if (exists) {
      res.status(400).send({ message: "category already exist" });
    } else {
      // create category
      const category = await prisma.category.create({
        data: {
          name: req.body.name,
        },
      });
      // success ?
      if (category) {
        console.log(category);
        res.status(201).send(category);
      } else {
        res.status(400).send({
          message: "error",
        });
      }
    }
  }
}

async function update(req, res) {
  const exists = await prisma.category.findFirst({
    where: { name: req.body.name },
  });
  if (exists) {
    const category = await prisma.category.update({
      where: {
        id: parseInt(req.body.id),
      },
      data: req.body,
    });

    res.send(category);
  } else {
    res.status(400).send({ message: "category does not exist" });
  }
}

async function del(req, res) {
  const exists = await prisma.category.findFirst({
    where: { id: parseInt(req.body.id) },
  });
  if (exists) {
    await prisma.category.delete({
      where: {
        id: parseInt(req.body.id),
      },
    });
    res.send();
  } else {
    res.status(400).send({ message: "category does not exits" });
  }
}

module.exports = {
  create,
  read,
  update,
  del,
};

/* HELPERS */

async function getCategory(query) {
  let categories = [];

  switch (query) {
    case "A-Z":
      categories = await prisma.category.findMany({
        orderBy: {
          name: "asc",
        },
      });
      break;
    case "Z-A":
      categories = await prisma.category.findMany({
        orderBy: {
          name: "desc",
        },
      });
      break;
    default:
      categories = await prisma.category.findMany({
        orderBy: {
          created_at: "desc",
        },
      });
  }

  return categories;
}
