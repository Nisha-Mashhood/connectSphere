import mentorModel from "../../../models/mentor.model.js";
import collaboration from "../../../models/collaboration.js";
import User from "../../../models/user.model.js";
import MentorRequest from "../../../models/mentorRequset.js";
class AdminRepository {
    // User  counts
    getTotalUsersCount = async () => {
        return await User.countDocuments({ role: 'user' });
    };
    //mentor counts
    getTotalMentorsCount = async () => {
        return await User.countDocuments({ role: 'mentor' });
    };
    //get Total Revenue
    getTotalRevenue = async () => {
        const result = await collaboration.aggregate([
            {
                $match: {
                    payment: true
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' }
                }
            }
        ]);
        const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
        //platform takes a fixed percentage (e.g., 10%)
        const platformProfit = totalRevenue * 0.1;
        return { totalRevenue, platformProfit };
    };
    // Pending collaboration requests 
    getPendingMentorRequestsCount = async () => {
        return await MentorRequest.countDocuments({ isAccepted: "Pending" });
    };
    //active collaborations
    getActiveCollaborationsCount = async () => {
        return await collaboration.countDocuments({ isCancelled: false });
    };
    // Revenue trends data
    getRevenueTrends = async (timeFormat, days) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const result = await collaboration.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    payment: true
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: timeFormat, date: '$createdAt' } },
                    totalRevenue: { $sum: '$price' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);
        return result.map(item => ({
            name: item._id,
            totalRevenue: item.totalRevenue,
            platformRevenue: Math.round(item.totalRevenue * 0.1), // 10% platform fee
            mentorRevenue: Math.round(item.totalRevenue * 0.9), // 90% to mentors
        }));
    };
    //User Growth Data
    getUserGrowth = async (timeFormat, days) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const userGrowth = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: timeFormat, date: '$createdAt' } },
                        role: '$role'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);
        const groupedByDate = {};
        userGrowth.forEach(item => {
            if (!groupedByDate[item._id.date]) {
                groupedByDate[item._id.date] = { name: item._id.date, users: 0, mentors: 0 };
            }
            if (item._id.role === 'user') {
                groupedByDate[item._id.date].users = item.count;
            }
            else if (item._id.role === 'mentor') {
                groupedByDate[item._id.date].mentors = item.count;
            }
        });
        return Object.values(groupedByDate);
    };
    // Pending mentor requests
    getPendingMentorRequests = async (limit) => {
        const query = mentorModel.find({ isApproved: 'Processing' })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        if (limit) {
            query.limit(limit);
        }
        return await query.exec();
    };
    // Top mentors
    getTopMentors = async (limit) => {
        try {
            const topMentors = await collaboration.aggregate([
                {
                    $match: { payment: true, isCancelled: false }, // completed & paid collaborations
                },
                {
                    $group: {
                        _id: "$mentorId",
                        totalEarnings: { $sum: "$price" }, // earnings
                        collaborationCount: { $sum: 1 }, // Counting collaborations
                    },
                },
                {
                    $sort: { totalEarnings: -1 }, // (highest first)
                },
                {
                    $limit: limit, // Limiting results
                },
                {
                    $lookup: {
                        from: "mentors",
                        localField: "_id",
                        foreignField: "_id",
                        as: "mentorInfo",
                    },
                },
                {
                    $unwind: "$mentorInfo",
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "mentorInfo.userId",
                        foreignField: "_id",
                        as: "userInfo",
                    },
                },
                {
                    $unwind: "$userInfo",
                },
                {
                    $project: {
                        _id: "$mentorInfo._id",
                        name: "$userInfo.name",
                        email: "$userInfo.email",
                        profilePic: "$userInfo.profilePic",
                        totalEarnings: 1,
                        collaborationCount: 1,
                    },
                },
            ]);
            return topMentors;
        }
        catch (error) {
            console.error("Error fetching top mentors:", error);
            throw error;
        }
    };
    //get recent collaborations
    getRecentCollaborations = async (limit) => {
        return await collaboration.find({ isCancelled: false })
            .populate({ path: 'userId', select: 'name profilePic' })
            .populate({
            path: 'mentorId',
            populate: { path: 'userId', select: 'name profilePic' },
        })
            .sort({ createdAt: -1 })
            .limit(limit);
    };
}
export default new AdminRepository();
//# sourceMappingURL=AdminDashboardRepositry.js.map