import express from "express";

const app = express();
const PORT = 4000;

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.get("/", (req, res) => {
  res.render("index");
});

app.listen(4000, () => {
  console.log(`Lisening http://localhost:${PORT}`);
});
