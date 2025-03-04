const isValidString = (value) => {
  return typeof value === "string" && value.trim() !== "";
};

const isNumber = (value) => {
  return typeof value === "number" && !isNaN(value);
};

const isValidPassword = (value) => {
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
  return passwordPattern.test(value);
};

module.exports = {
  isValidString,
  isNumber,
  isValidPassword,
};
