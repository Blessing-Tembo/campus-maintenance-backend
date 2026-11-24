const router = require("express").Router();
const pool = require("../db");

const validStatuses = [
  "Pending",
  "In progress",
  "Completed"
];

function validateRecord(data) {

  const {
    title,
    category,
    description,
    status
  } = data;

  if (
    typeof title !== "string" ||
    typeof category !== "string" ||
    typeof description !== "string" ||
    typeof status !== "string"
  ) {
    return "All fields must be strings.";
  }

  const t = title.trim();
  const c = category.trim();
  const d = description.trim();
  const s = status.trim();

  if (t.length < 3 || t.length > 80)
    return "Title must have 3 to 80 characters.";

  if (c.length < 2 || c.length > 40)
    return "Category must have 2 to 40 characters.";

  if (d.length < 5 || d.length > 300)
    return "Description must have 5 to 300 characters.";

  if (!validStatuses.includes(s))
    return "Invalid status.";

  return null;
}

function validateId(id) {

  const num = Number(id);

  if (
    !Number.isInteger(num) ||
    num <= 0
  ) {
    return false;
  }

  return true;
}

router.get("/", async (req, res, next) => {

  try {

    const result = await pool.query(
      "SELECT * FROM records ORDER BY id"
    );

    res.status(200).json(result.rows);

  } catch (error) {
    next(error);
  }

});

router.get("/:id", async (req, res, next) => {

  try {

    if (!validateId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Invalid id." });
    }

    const result = await pool.query(
      "SELECT * FROM records WHERE id=$1",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Record not found." });
    }

    res.status(200).json(result.rows[0]);

  } catch (error) {
    next(error);
  }

});

router.post("/", async (req, res, next) => {

  try {

    const errorMessage = validateRecord(req.body);

    if (errorMessage) {
      return res
        .status(400)
        .json({ message: errorMessage });
    }

    const result = await pool.query(
      `INSERT INTO records
      (title,category,description,status)
      VALUES($1,$2,$3,$4)
      RETURNING *`,
      [
        req.body.title.trim(),
        req.body.category.trim(),
        req.body.description.trim(),
        req.body.status.trim()
      ]
    );

    res.status(201)
      .json(result.rows[0]);

  } catch (error) {
    next(error);
  }

});

router.put("/:id", async (req, res, next) => {

  try {

    if (!validateId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Invalid id." });
    }

    const errorMessage = validateRecord(req.body);

    if (errorMessage) {
      return res
        .status(400)
        .json({ message: errorMessage });
    }

    const result = await pool.query(
      `UPDATE records
      SET title=$1,
          category=$2,
          description=$3,
          status=$4
      WHERE id=$5
      RETURNING *`,
      [
        req.body.title.trim(),
        req.body.category.trim(),
        req.body.description.trim(),
        req.body.status.trim(),
        req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Record not found." });
    }

    res.status(200)
      .json(result.rows[0]);

  } catch (error) {
    next(error);
  }

});

router.delete("/:id", async (req, res, next) => {

  try {

    if (!validateId(req.params.id)) {
      return res
        .status(400)
        .json({ message: "Invalid id." });
    }

    const result = await pool.query(
      "DELETE FROM records WHERE id=$1 RETURNING id",
      [req.params.id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "Record not found." }); 
    }

    res.status(200)
      .json({
        message: "Record deleted."
      });

  } catch (error) {
    next(error);
  }

});

module.exports = router;