const express = require('express');
const loginController = require('./controllers/login');
const fileController = require('./controllers/file');

const routes = express.Router();
routes.post('/createuser',loginController.create);
routes.post('/login',loginController.login);
routes.get('/allusers',loginController.allUsers);
routes.get('/files',fileController.list);
routes.post('/addfavorites',fileController.addFavorites);
routes.post('/listfavorites',fileController.listFavorites);
routes.post('/addfile',fileController.addFile);
routes.post('/deletefile',fileController.deleteFile);
routes.post('/removefavorites',fileController.removeFavorites);
routes.get('/listcategories',fileController.listCategories);
routes.get('/listsubcategories',fileController.listSubategories);
routes.put('/updatefile',fileController.updateFile);

module.exports = routes;