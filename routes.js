var express         = require('express'),
   routes          =  express.Router();
var userController  = require('./controller/user-controller');


routes.get('/', (req, res) => {
    return res.send(' API End point');
});

routes.post('/register', userController.registerUser);
routes.post('/login', userController.loginUser);
routes.get('/users/:email', userController.Users);
routes.delete('/users/:email', userController.DeleteUser);
routes.get('/messages/:mid/:id', userController.Messages);
routes.get('/activate/:email', userController.Activate);


module.exports = routes;
