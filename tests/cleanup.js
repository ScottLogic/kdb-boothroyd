const nodeq = require("node-q");

module.exports = (query) => {
  return new Promise((resolve, reject) => {
    nodeq.connect(
      {
        host: "localhost",
        port: 5001,
      },
      function (err1, con) {
        if (err1) reject(err1);

        con.k(query, function (err2) {
          if (err2) {
            return con.close(() => {
              reject(err2);
            });
          }

          con.close(() => {
            resolve();
          });
        });
      }
    );
  });
};
