const User = require("../model/user");

const saveUser = async (req,res,next)=>{
    if(!req.oidc.isAuthenticated()){
        const {sub,name,email} = req.oidc.user;}

    let user = await User.findOne({auth0Id:sub});
    if(!user){
        user = new user({
            auth0Id:sub,
            name:name,
            Email:email,
            point:0,
            skills:[],
        })
        await user.save();
        console.log("New user created:", user.email);
    }

    req.dbUser = user ;
    next();
}

module.exports = saveUser;

