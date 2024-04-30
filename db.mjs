// Import mongoose library
import mongoose from 'mongoose';

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
  }],
  // Array of references to user's blog
  blogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
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
  userName:{
    type: String,
    required:true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Array of references to replies on this post
  replies: [{
    // type: mongoose.Schema.Types.ObjectId,
    // ref: 'Reply'
    content: String,
    user: String,
    userName: String,
    date: Date
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
  userName:{
    type: String,
    required:true
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
    //type: mongoose.Schema.Types.ObjectId,
    //ref: 'User',
    type: String, //to be removed
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const blogSchema = new mongoose.Schema({
  thoughts: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  // Reference to the user who created the blog
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  mood: {
    type: String,
    required: true
  }
});


// Create and export mongoose models based on the schemas
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Reply = mongoose.model('Reply', replySchema);
const Goal = mongoose.model('Goal', goalSchema);
const Blog = mongoose.model('Blog', blogSchema);

//mongoose.connect(process.env.DSN);
mongoose.connect("mongodb+srv://ramshabilal:RsRRPoY9gZCVNjhi@cluster0.siam2zv.mongodb.net/cradleconnect?retryWrites=true&w=majority&appName=Cluster0");

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.once('open', () => {
    console.log('Connected to MongoDB');
});

export { User, Post, Reply, Goal, Blog };