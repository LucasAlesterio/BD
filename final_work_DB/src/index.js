const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const app = express();
//cd 'C:\Program Files\PostgreSQL\12\bin'
//.\pg_ctl -D "C:\Program Files\PostgreSQL\12\data" start

app.use(cors(
    //origin:'link'
    ));
app.use(express.json());
app.use(routes);

app.listen(3333);
