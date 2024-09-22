const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Joi = require("joi");

const schema = Joi.object({
  user_id: Joi.number().required(),
  category_id: Joi.number().required(),
  title: Joi.string().required(),
  body: Joi.string().required(),
});

/* CRUD */

async function read(req, res) {
  const posts = await getPosts(req.query.orderBy);
  res.send(posts);
}

async function create(req, res) {
  // validate
  const { error } = schema.validate(req.body);
  if (error) {
    res.status(400).send({ message: error.details[0].message });
  } else {
    // check user (exists)
    const userExists = await prisma.user.findFirst({
      where: {
        id: parseInt(req.body.user_id),
      },
    });
    const categoryExists = await prisma.category.findFirst({
      where: {
        id: parseInt(req.body.category_id),
      },
    });
    if (userExists && categoryExists) {
      // create post
      const post = await prisma.post.create({
        data: {
          user_id: parseInt(req.body.user_id),
          category_id: parseInt(req.body.category_id),
          title: req.body.title,
          body: req.body.body,
        },
      });
      // success ?
      if (post) {
        console.log(post);
        res.status(201).send(post);
      } else {
        res.status(400).send({
          message: "error",
        });
      }
    } else {
      res.status(400).send({ message: "user does not exist" });
    }
  }
}

async function update(req, res) {
  const exists = await prisma.post.findFirst({
    where: { id: parseInt(req.body.id) },
  });
  if (exists) {
    const post = await prisma.post.update({
      where: {
        id: parseInt(req.body.id),
      },
      data: req.body,
    });

    res.send(post);
  } else {
    res.status(400).send({ message: "post does not exist" });
  }
}

async function del(req, res) {
  const exists = await prisma.post.findFirst({
    where: { id: parseInt(req.body.id) },
  });
  if (exists) {
    await prisma.post.delete({
      where: {
        id: parseInt(req.body.id),
      },
    });
    res.send();
  } else {
    res.status(400).send({ message: "post does not exits" });
  }
}

module.exports = {
  create,
  read,
  update,
  del,
};

/* HELPERS */

async function getPosts(query) {
  let posts = [];

  switch (query) {
    case "A-Z":
      posts = await prisma.post.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          user: true,
          category: true,
        },
      });
      break;
    case "Z-A":
      posts = await prisma.post.findMany({
        orderBy: {
          name: "desc",
        },
        include: {
          user: true,
          category: true,
        },
      });
      break;
    default:
      posts = await prisma.post.findMany({
        orderBy: {
          created_at: "desc",
        },
        include: {
          user: true,
          category: true,
        },
      });
  }

  return posts;
}
