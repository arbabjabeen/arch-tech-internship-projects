const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends', 'username profilePicture')
      .populate('friendRequests', 'username profilePicture');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { bio, isPrivate } = req.body;
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (isPrivate !== undefined) updateData.isPrivate = isPrivate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const profilePicUrl = `/uploads/${req.file.filename}`;
    
    await User.findByIdAndUpdate(req.user.id, { profilePicture: profilePicUrl });
    
    res.json({ message: 'Profile picture updated successfully', profilePic: profilePicUrl });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const searchRegex = new RegExp(req.query.q, 'i');
    const users = await User.find({ username: searchRegex })
      .select('username _id profilePicture')
      .limit(10);
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('friends', 'username profilePicture');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Privacy check
    const isOwner = req.user.id === req.params.id;
    const isFriend = user.friends.some(f => f._id.toString() === req.user.id);
    
    let postQuery = { author: req.params.id };
    if (!isOwner) {
      if (user.isPrivate && !isFriend) {
        return res.json({ user, posts: [], message: 'This account is private' });
      }
      if (!isFriend) postQuery.visibility = 'public'; // non-friends only see public posts
    }

    const posts = await Post.find(postQuery)
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ user, posts });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') return res.status(404).json({ message: 'User not found' });
    res.status(500).send('Server Error');
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const userToRequest = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToRequest) return res.status(404).json({ message: 'User not found' });
    if (userToRequest._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: 'Cannot friend yourself' });
    }

    // Check if duplicate
    if (userToRequest.friends.includes(currentUser._id) || 
        userToRequest.friendRequests.includes(currentUser._id)) {
      return res.status(400).json({ message: 'Request already sent or already friends' });
    }

    userToRequest.friendRequests.push(currentUser._id);
    await userToRequest.save();

    // Notification logic
    const notification = new Notification({
      recipient: userToRequest._id,
      sender: currentUser._id,
      type: 'friendRequest'
    });
    await notification.save();

    const io = req.app.get('io');
    if (io) {
      io.to(userToRequest._id.toString()).emit('newNotification', {
        type: 'friendRequest',
        senderName: currentUser.username,
        message: `${currentUser.username} sent you a friend request!`
      });
    }

    res.json({ message: 'Friend request sent' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const senderUser = await User.findById(req.params.id);

    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== senderUser._id.toString()
    );

    if (!currentUser.friends.includes(senderUser._id)) {
      currentUser.friends.push(senderUser._id);
      senderUser.friends.push(currentUser._id);
      
      await currentUser.save();
      await senderUser.save();

      const notification = new Notification({
        recipient: senderUser._id,
        sender: currentUser._id,
        type: 'friendAccept'
      });
      await notification.save();

      const io = req.app.get('io');
      if (io) {
        io.to(senderUser._id.toString()).emit('newNotification', {
          type: 'friendAccept',
          senderName: currentUser.username,
          message: `${currentUser.username} accepted your friend request!`
        });
      }
    }

    res.json({ message: 'Friend request accepted', user: senderUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
