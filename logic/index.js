const replace = (text, toReplace, withThis) => {
  const originalText = text;
  const wordToReplace = toReplace;
  const regexp = new RegExp(wordToReplace, "gi");
  const newWord = withThis;
  const result = originalText.replace(regexp, newWord);
  return result;
};

module.exports = replace;
