const Community = require('../model/community');
const User = require('../model/user');


const communityController ={
// Create a new community
    createCommunity: async(req,res)=>{
        try{
            const auth0Id = req.oidc.user.sub;
            const{name, description, tags, rules, isPublic} = req.body;
            
            //find the user
            const user = await User.findOne({auth0Id});
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
    },

// Get all community with search and tags
    getCommunities: async(req,res)=>{
        try{
            const {page =1 , limit=10,search,tags} = req.query;
            const query = {isPublic:true};
            
            if (search){
                query.$or = [
                    {name: {$regex: search, $options: 'i'}},
                    {description: {$regex: search, $options: 'i'}}
                ];
            }

            if(tags){
                query.tags = {$in: tags.split(',')};
            }

            const communities = await Community.find(query)
               .populate('createdBy','name')
               .sort({'stats.totalMembers': -1})
               .limit(limit * 1)
               .skip((page -1) * limit)
               .exec();
            
            const total = await Community.countDocuments(query);

            res.json({
                success: true,
                communities,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalCommunities: total
                }});

        }catch(error){
            res.status(500).json({success:false, error:error.message});

        }
    },

    // Get community Details

    getCommunityById: async (req, res) => {
    try {
      const { communityId } = req.params;

      const community = await Community.findById(communityId)
        .populate('createdBy', 'name')
        .populate('members.user', 'name skills points')
        .exec();

      if (!community) {
        return res.status(404).json({ success: false, error: 'Community not found' });
      }

      res.json({ success: true, community });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
     },


    // Join a community
    joinCommunity: async(req,res) =>{
        try{
            const auth0Id = req.oidc.user.sub;
            const {communityId} = req.params;

            const user = await User.findOne({auth0Id});
            if (!user){
                return res.status(404).json({success:false, error:'User not found'});
            }

            const community = await Community.findById(communityId);
            if (!community){
                return res.status(404).json({success:false, error:'Community not found'});
            }
            //check if user is already a member

            const isMember = community.members.some(member => member.user.toString() === user._id.toString());
            if (isMember){
                return res.status(400).json({success:false, error:'User is already a member of this community'});
            }
            //add user to community members
            community.members.push({user: user._id, role:'member'});
            community.stats.totalMembers +=1;
            await community.save();

            //add community to user's list
            user.communities.push(community._id);
            await user.save();

            res.json({success:true, message:'Joined community successfully', community});
        }catch(error){
            res.status(500).json({success:false, error:error.message});
        }
    },

    // Remove a member from community

    leaveCommunity: async(req,res) =>{
        try{
            const auth0Id = req.oidc.user.sub;
            const {communityId} = req.params;
            const user = await User.findOne({auth0Id});
            if (!user){
                return res.status(404).json({success:false, error:'User not found'});
            }
            const community = await Community.findById(communityId);
            if (!community){
                return res.status(404).json({success:false, error:'Community not found'});
            }

            //remove user from community
            community.members = community.members.filter(member => member.user.toString() !== user._id.toString());
            community.stats.totalMembers -= 1;
            await community.save();

            //remove community from user's list
            user.communities = user.communities.filter(commId => commId.toString() !== community._id.toString());
            await user.save();

            res.json({success:true, message:'Left community successfully'});

        }catch(error){
            res.status(500).json({success:false, error:error.message});
        }

    },

};

module.exports = communityController;

       
















































