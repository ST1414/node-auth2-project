// 4.3.2 JSON Web Tokens (JWT)
// Tue. Dec 14, 2021

const server = require('./api/server.js');

const PORT = process.env.PORT || 9000;

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
