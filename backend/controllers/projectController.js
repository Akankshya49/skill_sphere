const Project = require('../model/project');
const User = require('../model/user');
const Review = require('../model/review');
const Community = require('../model/community'); 

const projectController ={
     // Create a new project

     createproject: async(req,res) =>{
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

            const {title, description, techStack, skillsRequired, maxCollaborators, githubRepo} = req.body;

            // user  should be a member of a community

            const isMember = community.members.some(member => member.user.toString() === user._id.toString());
            if (!isMember){
                return res.status(403).json({success:false, error:'You must be a member of the community to post a project'});
            }

            const project = new project({
                title,
                description,
                techStack,
                skillsRequired,
                maxCollaborators,
                githubRepo,
                community: community._id,
                postedBy: user._id,
                collaborators:[{user: user._id, role: 'project Lead',status:'active'}]
            });
            await project.save();

            community.stats.totalProjects +=1;
            await community.save();
            res.status(201).json({success:true, project});


        }catch(error){
            res.status(500).json({success:false,error:error.message});
        }
     }































}