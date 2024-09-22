var express = require("express");
const {
  read,
  create,
  update,
  del,
} = require("../controllers/CategoryController");
var router = express.Router();

/* GET users listing. */
router.get("/", read);
router.post("/", create);
router.put("/", update);
router.delete("/", del);

module.exports = router;
