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
    },
    //Get project by filter
    getProjects: async(req,res)=>{
        try{
            const {page=1,limit=10,search,techstack,status,communityId}= req.query;
            const query = {};
            if (search){
                query.$or=[
                    {title: {$regex: search, $options: 'i'}},
                    {description: {$regex: search, $options: 'i'}}
                ];
            }
            if (techstack) {
                query.techStack = { $in: techStack.split(',') };
            }

            if (status) {
                query.status = status;
            }

            if (communityId) {
                query.community = communityId;
            }
            const projects = await Project.find(query)
               .populate('postedBy','name')
               .populate('community','name')
               .populate('collaborators.user','name')
               .sort({createdAt: -1})
               .limit(limit * 1)
               .skip((page -1) * limit)
               .exec();
            
            const total = await Project.countDocuments(query);
            res.json({
                success:true,
                projects,
                pagination:{
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProjects: total
                }
            });
        }catch(error){
            res.status(500).json({success:false,error:error.message});
        }
    },

    //Get project by id
    getProjectById: async(req,res)=>{
        try{
            const {projectId} = req.params;
            const project = await Project.findById(projectId)
                .populate('postedBy','name')
                .populate('community','name description')
                .populate('collaborators.user','name skills');
            if (!project){
                return res.status(404).json({success:false, error:'Project not found'});
            }
            res.json({success:true, project});
        }catch(error){
            res.status(500).json({success:false,error:error.message});
        }
    },

    //Join a project
    joinproject: async(req,res)=>{
        try{
            const auth0Id = req.oidc.user.sub;
            const {projectId} = req.params;
            const {role} = req.body;
            const user = await User.findOne({auth0Id});
            if (!user){
                return res. status(404).json({success:false, error:'User not found'});  }

            const project = await Project.findById(projectId);
            if (!project){
                return res.status(404).json({success.false, error:"Project not found"});
            }

            // check if user is already a collaborator
            const isCollaborator = project.collaborators.some(collab => collab.user.toString() === user._id.toString());
            if (isCollaborator){
                return res.status(400).json({success:false , error:"You are already a collaborator on this project "});

            }

            //if open 
            if (project.status !== "open"){
                return res.status(400).json({success:false, error:"Project is not open for collaboration"});
            }

            //check if max collaborators reached
            if(project.collaborators.length === project.maxCollaborators){
                return res.status(400).json({success:false, error:"Maximum number of collaborators reached"});}
            
            // Add a user to collaborator
            project.collaborators.push({user: user_id,role:role||'Contributor' , status:"Active"});
            await project.save();
            res.json({success:true, message:"You have successfully joined the project as a collaborator"});


        }catch(error){
            res.status(500).json({success:false,error:error.message});
        }

    },

    































}