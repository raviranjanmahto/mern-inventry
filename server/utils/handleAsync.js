const handleAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = handleAsync;

// IS SAME AS
// module.exports = fn => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };
