const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const util = require("util");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);

const replace = require("./logic");

const filesPath = path.join(__dirname, "files");
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/files", async (req, res) => {
  try {
    const files = await readDir(filesPath);
    res.json({ status: "ok", files: files });
  } catch (error) {
    res.status(500).send("Something went wrong");
  }
});

app.post("/files/add/:name", async (req, res) => {
  try {
    const fileName = req.params.name;
    const filePath = path.join(filesPath, fileName);
    const fileContents = req.body.text;
    await writeFile(filePath, fileContents);
    res.redirect(303, "/files");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.put("/files/replace/:oldFile/:newFile", async (req, res) => {
  try {
    const oldFile = req.params.oldFile;
    const newFile = req.params.newFile;
    const originalFilePath = path.join(filesPath, `${oldFile}.txt`);
    const targetFilePath = path.join(filesPath, `${newFile}.txt`);
    const toReplace = req.body.toReplace;
    const withThis = req.body.withThis;
    const originalContent = await readFile(originalFilePath, "utf-8");
    const newContent = replace(originalContent, toReplace, withThis);
    await writeFile(targetFilePath, newContent);
    res.redirect(303, "/files");
  } catch (error) {
    res
      .status(404)
      .send({ status: "404", message: `no file named ${oldFile}` });
  }
});

app.get("/report", async (req, res) => {
  try {
    const reportPath = path.join(filesPath, "..", "test", "report.json");
    console.log(reportPath);
    const reportContent = await readFile(reportPath, "utf-8");
    const json = JSON.parse(reportContent);
    res.json({ status: "ok", report: json });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Replacer is serving at http://localhost:${port}`)
);
