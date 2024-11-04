const express = require('express');
const bodyParser = require('body-parser');
const m3uRoutes = require('./routes/m3uRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', m3uRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});