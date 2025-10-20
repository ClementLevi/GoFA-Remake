const express = require("express");
const routes = require("./routes");
const {requestLogger,errHandler} = require('./libs/RequestLogger');
const app = express();

// Static files
app.use("/public", express.static("public"));
// Middlewares
app.use(requestLogger);
app.use(errHandler);
// Routes
app.use("/", routes);

// Start server
app.listen(process.env.port ?? 3000, () => {
    console.log(`admin server is now deployed on port ${process.env.port ?? 3000}`);
});
