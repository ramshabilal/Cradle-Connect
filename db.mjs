// Import mongoose library
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  // Array of references to the user's posts
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  // Array of references to the user's goals
  goals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }]
});

// Define the post schema
const postSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  // Reference to the user who created the post
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Array of references to replies on this post
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply'
  }]
});

// Define the reply schema
const replySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  // Reference to the user who created the reply
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

// Define the goal schema
const goalSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  // Reference to the user who created the goal
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

// Create and export mongoose models based on the schemas
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Reply = mongoose.model('Reply', replySchema);
const Goal = mongoose.model('Goal', goalSchema);

module.exports = { User, Post, Reply, Goal };

mongoose.connect(process.env.DSN);

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});