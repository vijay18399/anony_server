var User = require("../models/user");
var Message = require("../models/message");
var Group = require("../models/group");
var jwt = require("jsonwebtoken");
var config = require("../config/config");
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
         user: 'edumonker@gmail.com',
         pass: 'vijay18399'
     }
 });

function createToken(user) {
  return jwt.sign(
    user,
    config.jwtSecret,
    {
      expiresIn: 86400 // 86400 expires in 24 hours
    }
  );
}

exports.registerUser = (req, res) => {

  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      return res.status(400).json({ msg: "The email already exists" });
    }
    if (err) {
      return res.status(400).json({ msg: err });
    }
      let newUser = User(req.body);

      newUser.save((err, user) => {
        if (err) {
          return res.status(400).json({ msg: err });
        }
        const mailOptions = {
          from: 'edumonker@gmail.com', // sender address
          to: req.body.email, // list of receivers
          subject: 'Activation of Account', // Subject line
          html: '<center><h1>please <a href="https://fikarmat.herokuapp.com/activate/'+req.body.email+'">click here </a> to activate</h1></center>',// plain text body
        };
        transporter.sendMail(mailOptions, function (err, info) {
          if(err)
            console.log(err)
          else
            console.log(info);
       });
        return res.status(201).json(user);
      });

  });
};

exports.loginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res
      .status(400)
      .send({ msg: "You need to give  username and password" });
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      return res.status(400).send({ msg: err });
    }

    if (!user) {
      return res.status(400).json({ msg: "The email does not have an account" });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        if(user.isActivated){
          return res.status(200).json({
            token: createToken(user)
          });
        }
        else{
          return res.status(400).json({ msg: "Account not activated please check youe email" });
        }
      
      } else {
        return res
          .status(400)
          .json({ msg: " email and password don't match." });
      }
    });
  });
};

exports.Users = (req, res) => {
  console.log(req.params.email);
  User.find({ email: { $ne: req.params.email } }, (err, users) => {
    if (users) {
      return res.status(201).json(users);
    }
  });
};
exports.DeleteUser = (req, res) => {
  console.log(req.params.email);
  Group.deleteOne({ email: { $eq: req.params.email } }, (err, user) => {
    if (user) {
      return res.status(201).json(users);
    }
  });
};

exports.Activate = (req, res) => {
  console.log(req.params.email);
  res.setHeader('Content-Type', 'text/html');
  User.findOne({ email: req.params.email }, (err, user) => {
    if (err) {
      return res.send('<center style="color : red;" ><h1>404 Not Found</h1></center>');
    }

    if (!user) {
      return  res.send('<center style="color : red;" ><h1>The email does not have an account</h1></center>');
    }
    if(user){
      user['isActivated'] = true;
      User.updateOne({ email: { $eq: req.params.email } },user, (err, user) => {
        if (user) {
          return res.send('<center style="color : red;" ><h1>Account Activated successfully</h1></center>');
        }
      });
    }
  });

};
exports.Messages = (req, res) => {
  if (req.params.id && req.params.mid) {
    to = req.params.id;
    from = req.params.mid;
    q1 = {
      $and: [{ to: { $eq: to } }, { from: { $eq: from } }]
    };
    q2 = {
      $and: [{ to: { $eq: from } }, { from: { $eq: to } }]
    };

    query = { $or: [q1, q2] };

    Message.find(query, (err, messages) => {
      if (messages) {
        console.log(messages);
        return res.status(201).json(messages);
      }
    });
  } else {
    return res.status(400).json({ msg: " invalid query attempted" });
  }
};


