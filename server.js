require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

const origins =
(process.env.CLIENT_ORIGINS || "")
.split(",")
.map(v => v.trim())
.filter(Boolean);

app.use(cors({
  origin: origins
}));

app.use(express.json());

app.get("/", (req, res) => {

  res.send(`
  <html>
  <head>
  <title>Activity 7 API</title>
  <style>
  body{
     font-family:Arial;
     padding:20px;
     max-width:1000px;
     margin:auto;
  }
  table{
     border-collapse:collapse;
     width:100%;
  }
  td,th{
     border:1px solid #ccc;
     padding:10px;
  }
  </style>
  </head>
  <body>

  <h1>Maintenance Request Management System</h1>

  <p><b>Student Number:</b> XXXXXXXX</p>

  <p>
  Backend API for managing maintenance requests.
  </p>

  <h2>Links</h2>

  <ul>
  <li><a href="/health">Health Check</a></li>
  <li><a href="/api/records">All Records</a></li>
  </ul>

  <h2>Routes</h2>

  <table>
  <tr>
  <th>Method</th>
  <th>Route</th>
  </tr>

  <tr><td>GET</td><td>/</td></tr>
  <tr><td>GET</td><td>/health</td></tr>
  <tr><td>GET</td><td>/api/records</td></tr>
  <tr><td>GET</td><td>/api/records/:id</td></tr>
  <tr><td>POST</td><td>/api/records</td></tr>
  <tr><td>PUT</td><td>/api/records/:id</td></tr>
  <tr><td>DELETE</td><td>/api/records/:id</td></tr>
  </table>

  <h2>Editable Fields</h2>

<pre>
{
 "title":"Broken classroom light",
 "category":"Electrical",
 "description":"Room B12 light not working",
 "status":"Pending"
}
</pre>

  <p>
  Status values:
  Pending,
  In progress,
  Completed
  </p>

  <p>
  Success:
  200,
  201
  </p>

  <p>
  Errors:
  400,
  404,
  500,
  503
  </p>

  </body>
  </html>
  `);

});

app.get("/health", async (req, res) => {

  try {

    await pool.query("SELECT 1");

    res.status(200).json({
      status: "healthy"
    });

  } catch {

    res.status(503).json({
      message: "Database unavailable."
    });

  }

});

app.use(
  "/api/records",
  require("./routes/record")
);

app.use((req, res) => {

  res.status(404).json({
    message: "Route not found."
  });

});

app.use((error, req, res, next) => {

  console.error(error);

  if (
    error instanceof SyntaxError &&
    "body" in error
  ) {
    return res.status(400).json({
      message: "Malformed JSON."
    });
  }

  res.status(500).json({
    message: "Internal server error."
  });

});

const port =
process.env.PORT || 3000;

app.listen(
  port,
  "0.0.0.0",
  () => {
    console.log(
      `Server listening on port ${port}`
    );
  }
);