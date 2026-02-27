const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req,res)=>{
  const user = await User.create(req.body);
  res.json(user);
};

exports.login = async (req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(user && await user.matchPassword(password)){
    res.json({
      token: jwt.sign({id:user._id}, process.env.JWT_SECRET,{expiresIn:'7d'})
    });
  }else{
    res.status(401).json({message:"Invalid credentials"});
  }
};