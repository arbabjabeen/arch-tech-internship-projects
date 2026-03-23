const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).populate('friends', '_id');
    const friendIds = currentUser.friends.map(f => f._id);
    friendIds.push(currentUser._id); // Include self

    // Get posts that are public OR authored by user/friends
    const posts = await Post.find({
      $or: [
        { visibility: 'public' },
        { author: { $in: friendIds } }
      ]
    })
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, visibility } = req.body;
    
    const postData = {
      author: req.user.id,
      content,
      visibility: visibility || 'public'
    };

    if (req.file) {
      postData.image = `/uploads/${req.file.filename}`;
    }

    const newPost = new Post(postData);
    const post = await newPost.save();
    
    await post.populate('author', 'username profilePicture');
    
    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.emit('newPost', post);
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.json([]);

    const searchRegex = new RegExp(q, 'i');
    
    const currentUser = await User.findById(req.user.id);
    const friendIds = currentUser.friends;
    friendIds.push(currentUser._id);

    const posts = await Post.find({
      content: searchRegex,
      $or: [
        { visibility: 'public' },
        { author: { $in: friendIds } }
      ]
    })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    let isLiked = false;
    if (post.likes.includes(req.user.id)) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
      isLiked = true;
    }
    
    await post.save();

    // Sockets specific to post
    const io = req.app.get('io');
    if (io) {
      io.emit('postLiked', { postId: post._id, likes: post.likes, byUser: req.user.id, action: isLiked ? 'like' : 'unlike' });
    }

    if (isLiked && post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'like',
        post: post._id
      });
      await notification.save();

      if (io) {
        io.to(post.author.toString()).emit('newNotification', {
          type: 'like',
          senderName: currentUser.username,
          message: `${currentUser.username} liked your post!`,
          postId: post._id
        });
      }
    }

    res.json({ likes: post.likes });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const newComment = {
      user: req.user.id,
      text: req.body.text
    };

    post.comments.push(newComment);
    await post.save();

    await post.populate('comments.user', 'username profilePicture');
    const addedComment = post.comments[post.comments.length - 1];

    const io = req.app.get('io');
    if (io) {
      io.emit('postCommented', { postId: post._id, comment: addedComment, count: post.comments.length });
    }
    
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: post._id
      });
      await notification.save();

      if (io) {
        io.to(post.author.toString()).emit('newNotification', {
          type: 'comment',
          senderName: currentUser.username,
          message: `${currentUser.username} commented on your post!`,
          postId: post._id
        });
      }
    }

    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
