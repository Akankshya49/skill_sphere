const Community = require('../model/community');


const communityController ={
// Create a new community
    createCommunity: async(req,res)=>{
        try{
            const auth0Id = req.oidc.user.sub;
            const{name, description, tags, rules, isPublic} = req.body;
            
            //find the user
            const user = await UserActivation.findOne({auth0Id});
            if (!user){
                return res.status(404).json({success:false, error:'User not found'});
            }
            //create community
            const community = new Community({
                name,
                description,
                tags,
                rules,
                isPublic,
                createdBy: user._id
            });

            await community.save();

            //add community to user's list
            user.communities.push(community._id);
            await user.save();

            res.status(201).json({success:true, community});
            }
        catch(error){
            res.status(500).json({success:false,error:error.message});
        }
    }














































}