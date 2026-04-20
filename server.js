const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('API Discover en ligne !'));
app.listen(5000, () => console.log('Serveur sur port 5000'));