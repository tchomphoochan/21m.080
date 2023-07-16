const fs = require("fs");
const express = require('express');
const cors = require("cors");
const app = express();
const port = 80;

app.use(cors());
app.use(express.json())

app.post('/javascript', (req, res) => {
    fs.writeFileSync("test.js", req.body.code);
    res.json({ message: "success" });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
})