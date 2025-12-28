const User = require('../model/user');
const Meeting = require('../model/meeting');
const Community = require('../model/community');
const Project = require('../model/project');
const community = require('../model/community');

const meetingController = {
    //New meeting
    createMeeting: async(req,res)=>{
        try{
            const auth0Id = req.oidc.user.sub;
            const {title , agenda , scheduledAt , meetingLink, communityId} = req.body;
            const user = await User.findOne({ auth0Id });
            if (!user){
                return res.status(404).json({success:false, error:'User not found'});
            }
            const community = await Community.findById(communityId);
            if (!community){
                return res.status(404).json({success:false, error:'Community not found'});
            }
            //user should be a member of the community
            const isMember = community.members.some(member => member.user.toString()=== user._id.toString())
            if (!isMember){
                return res.json({success:false, error:'You must be a member of the community to schedule a meeting'});
            } 

            const meeting = new Meeting({
                title,
                agenda,
                scheduledAt: new Date(scheduledAt),
                meetingLink,
                scheduledBy: user._id

            });
            await meeting.save();
            res.status(201).json({success:true, meeting});
            }catch(error){
                res.status(500).json({success:false , error:error.message});
            

        }
    },

    // Get meeting by community
    getmeetings: async(req,res)=>{
        try{
            const {communityId} = req.params;
            const { upcoming} = req.query;
            
            const query = {community: communityId};
            if (upcoming === 'true'){
                query.scheduledAt = {$gte: new Date()};
                query.status ={$in: ['Scheduled', 'Live']};
            } 
            const meetings = await Meeting.find(query)
                .populate('scheduledBy', 'name')
                .populate('community', 'name')
                .sort({ scheduledAt: 1 })
                .exec();

            res.json({ success: true, meetings });        
        }catch(error){
            res.status(500).json({success:false, error:error.message});
        }
    },

    // Get meeting by Id
    getMeetingById: async (req, res) => {
    try {
      const { meetingId } = req.params;

      const meeting = await Meeting.findById(meetingId)
        .populate('scheduledBy', 'name')
        .populate('community', 'name description')
        .exec();

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      res.json({ success: true, meeting });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Update meeting status (for going live, completing, etc.)
    updateMeetingStatus: async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { status } = req.body;
      const auth0Id = req.oidc.user.sub;

      const user = await User.findOne({ auth0Id });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const meeting = await Meeting.findById(meetingId);
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      // Check if user is the meeting organizer
      if (meeting.scheduledBy.toString() !== user._id.toString()) {
        return res.status(403).json({ success: false, error: 'Only meeting organizer can update status' });
      }

      meeting.status = status;
      await meeting.save();

      res.json({ success: true, message: 'Meeting status updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = meetingController;