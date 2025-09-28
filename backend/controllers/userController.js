const User = require ('../model/user');
const Community = require('../model/community');


const userController = {
    // Create profile

    getProfile: async (req,res) =>{
        try{
            const auth0Id = req.oidc.user.sub;

            let user = await User.findOne ({auth0Id})
            .populate('communities','name description avatar')
            .exec();

            if (!user){
                user = new user({
                    auth0Id,
                    name: req.oidc.user.name,
                    email: req.oidc.user.email
                });
                await user.save();

            }

            res.json({success: true, user});
            
        } catch(error){
            res.status(500).json({success:false,error: error.message});
        }
    },

    //update profile

    updateProfile: async(req,res) =>{
        try{
            const auth0Id = req.oidc.user.sub;
            const {name,skills} = req.body;

            const user = await user.findOneAndupdate(
                {auth0Id},
                { name,skills },
                { new: true, runvalidators: true }
            );
            if (!user){
                return res.status(404).json({ success: false, error: 'User not found' });
            }
            res.json({ success: true, user });
     }  catch(error){
        res.status(400).json({success:false, error:error.message});
        }
    },


    // user's dashboard

    getDashboard: async(req,res) =>{
        try{
            const auth0Id = req.oidc.user.sub;
            const user = await User

        }catch{

        }
    }














};