const replace = require("./logic/index");
const fs = require("fs");
const assert = require("assert");
const util = require("util");
const path = require("path");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const rawInputs = process.argv;
const cleanedInputs = rawInputs.slice(2);

const texToReplace = cleanedInputs[1];
const newText = cleanedInputs[2];
const originFileName = cleanedInputs[0];
const targetFileName = cleanedInputs[3];

if (
  originFileName === undefined ||
  texToReplace === undefined ||
  newText === undefined ||
  targetFileName === undefined
) {
  console.log(
    "Missing arguments: you must pass four arguments, example: node cli.js test1.txt 1 2 test2.txt"
  );
  return;
}

const originFiletPath = path.join(__dirname, "files", originFileName);
const targetFilePath = path.join(__dirname, "files", targetFileName);

const main = async (originalFile, texToReplace, withThis, targetFile) => {
  try {
    console.log("Reading the  original file...");
    const oldFileContent = await readFile(originalFile, "utf-8");
    const newFileContent = replace(oldFileContent, texToReplace, withThis);
    console.log("Writing the new file...");
    await writeFile(targetFile, newFileContent);
    console.log("Reading the new file...");
    const newTargetContent = await readFile(targetFile, "utf-8");
    console.log("Checking that everything is fine...");
    assert.strictEqual(newTargetContent, newFileContent);
    console.log("Success, your new text is ready!");
  } catch (error) {
    console.log("Something went wrong: ", error);
  }
};

main(originFiletPath, texToReplace, newText, targetFilePath);

// little challenges:
// : -help
//   if a user passes in "-help" as any command line argument,
//   log a little description of how the CLI works
// : -list
//   if a user passes in "-list" as any command line argument,
//   log a list of all the file names in "./files"
