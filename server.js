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

// GET: '/files'
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
// redirect -> GET: '/files'

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

// PUT: '/files/replace/:oldFile/:newFile'
//  body: {toReplace: "str to replace", withThis: "replacement string"}
//  route logic:
//    read the old file
//    use the replace function to create the new text
//    write the new text to the new file name
//  note - params should not include .txt, you should add that in the route logic
// failure: {status: '404', message: `no file named ${oldFile}`  }
// success: redirect -> GET: '/files'

// GET: '/report'
//  reads the contents from ./test/report.json and sends it
// response: {status: 'ok', report }

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Replacer is serving at http://localhost:${port}`)
);
