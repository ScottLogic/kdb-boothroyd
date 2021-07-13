const storage = require("./storage/storage");
// const ElementUI = require("element-ui");
const app = require("./app.js");

storage.init();

// Vue.use(ElementUI);
new Vue(app);
