import './db.mjs';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import flash from 'connect-flash';

import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import session from 'express-session';
import hbs from 'hbs';
import Handlebars from 'handlebars';
import moment from 'moment';

const app = express();

const sessionOptions = {
    secret: "abcdefg",
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));
app.use(flash());

import {User, Post, Reply, Goal, Blog} from './db.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: false }));

// Register Handlebars helper for date formatting
hbs.registerHelper('formatDate', function(date) {
  return moment(date).format('MMMM Do YYYY, h:mm a');
});

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

app.get("/signup", (req, res) => {
    res.render('signup');
});

app.post('/signup', async (req, res) => {
    let { name, email, password, retypePassword } = req.body;
    email = email.toLowerCase();
    const MIN_PASSWORD_LENGTH = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);

    try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.render('signup', { error: 'Email already is use. Please try again!' });
        }
  
        if (password.length < MIN_PASSWORD_LENGTH || !hasUpperCase || !hasNumber) {
          return res.render('signup', { error: 'Invalid Password Format. Password must be at least 8 characters long and must contain at least 1 uppercase and 1 digit.' });
        }
  
        if (password !== retypePassword) {
          return res.render('signup', { error: 'Passwords do not match. Please try again!' });
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS, 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({
            name,
            password: hashedPassword,
            email: email,
            posts: [],
            goals: [],
            blogs: []
        });

        await newUser.save();

        res.redirect('/signin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

});


passport.use(new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
    console.log(email, password)
      email = email.toLowerCase()
      try {
        const user = await User.findOne({ email });
  
        if (!user) {
          return done(null, false, { message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
  
        if (passwordMatch) {
            console.log("User found");
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      } catch (error) {
        return done(error);
      }
    }
  ));
  
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  app.use(passport.initialize());
  app.use(passport.session());

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect('/signin');
    }
};

// app.get("/", isAuthenticated, (req, res) => {
//     res.render('home');
// });

app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
      res.render('home');
  } else {
      res.render('landing');
  }
});

app.get("/articles", isAuthenticated, (req, res) => {
  console.log("Articles page");
    res.render('articles');
});

app.get("/faq", isAuthenticated, (req, res) => {
    res.render('faq');
});

app.get("/diary", isAuthenticated, async (req, res) => {
    try {
        const allEntries = await Blog.find({ user: req.user._id });

        if (allEntries.length === 0) {
            return res.render('diary', { allEntries });
        }
        
        allEntries.sort((a, b) => {
            return b.date - a.date;
        });
        // allEntries.sort({ date: -1 });
        res.render('diary', { allEntries });
    } catch (error) {
        // Handle errors appropriately
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/addDiary", isAuthenticated, (req, res) => {
    res.render('addDiary');
});

app.post('/addDiary', isAuthenticated, async (req, res) => {
    let { date, summary, thoughts, mood } = req.body;
    try {
      const newEntry = new Blog({
        thoughts: thoughts,
        summary: summary,
        user: req.user._id,
        date: date,
        mood: mood
      });
      await newEntry.save();
      res.redirect('/diary');
    } catch (error) {
      return res.render("addDiary", { error: 'Please Select a Mood by Clicking on the Emojis!' })
    }
});

// Define a route to handle the delete request
app.post('/deleteDiary', async (req, res) => {
  const blogId = req.body.blogId;

  try {
      // Find the blog by ID and remove it from the database
      await Blog.findOneAndDelete({ _id: blogId });
      res.redirect('/diary');
  } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).send('Error deleting blog');
  }
});

app.get("/community", isAuthenticated, async (req, res) => {
  try {
    let allPosts = await Post.find({});
    //console.log("Posts: ", allPosts);
    if (allPosts.length === 0) {
        return res.render('community', { allPosts });
    }
    
    allPosts.sort((a, b) => {
        return b.date - a.date;
      });
  
    // Sorting functionality
    const sortBy = req.query.sortOrder;
    // console.log("sortBy: ", sortBy);
    if (sortBy === 'asc') {
        allPosts.sort((a, b) => a.date - b.date); // Sorting in ascending order
    } else if (sortBy === 'desc') {
        allPosts.sort((a, b) => b.date - a.date); // Sorting in descending order
    }

    // Search functionality
    const searchTerm = req.query.searchQuery;
    // console.log("searchTerm: ", searchTerm);
    if (searchTerm) {
        allPosts = allPosts.filter(post =>
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } 
    res.render('community', { allPosts });
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
});

app.get("/addPost", (req, res) => {
    res.render('addPost');
});

app.post("/addPost", isAuthenticated, async (req, res) =>{
  let {message} = req.body;
  const newPost = new Post({
    content: message,
    user: req.user._id,
    userName: req.user.name
});

await newPost.save();
console.log("Saved");
res.redirect('/community');
});

app.get("/myPosts", isAuthenticated, async (req, res) => {
  try {
    let allPosts = await Post.find({user: req.user._id});
  
    if (allPosts.length === 0) {
        return res.render('community', { allPosts });
    }
    
    allPosts.sort((a, b) => {
        return b.date - a.date;
      });
  
    // Sorting functionality
    const sortBy = req.query.sortOrder;
    // console.log("sortBy: ", sortBy);
    if (sortBy === 'asc') {
        allPosts.sort((a, b) => a.date - b.date); // Sorting in ascending order
    } else if (sortBy === 'desc') {
        allPosts.sort((a, b) => b.date - a.date); // Sorting in descending order
    }

    // Search functionality
    const searchTerm = req.query.searchQuery;
    // console.log("searchTerm: ", searchTerm);
    if (searchTerm) {
        allPosts = allPosts.filter(post =>
            post.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    } 
    res.render('myPosts', { allPosts });
} catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
}
});

app.post('/myPosts/delete/:postId', isAuthenticated, async (req, res) => {
  const userId = req.user._id;
  const postId = req.params.postId;

  try {
      // Query the Event collection to find the specific event
      const post = await Post.findOne({ _id: postId, user: userId }).exec();

      if (!post) {
          return res.status(404).send('Post not found or you do not have permission to delete it.');
      }

      // Delete the event
      await Post.deleteOne({ _id: postId, user: userId }).exec();

      // Redirect back to the myevents route or another appropriate route
      res.redirect('/myPosts');
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


app.post("/addReply", isAuthenticated, async (req, res) => {
  try {
      const postId = req.body.postId; // Assuming you're sending postId in the request body
      const content = req.body.comment; // Assuming you're sending the reply content in the request body
      const userName = req.user.name; // Assuming you have access to the authenticated user's name
      console.log("Hereeee:\n", "\n", req.body, "\n", req.user);
      // Find the post by its ID
      const post = await Post.findById(postId);

      if (!post) {
          return res.status(404).json({ error: "Post not found" });
      }

      // Create a new reply object
      const newReply = {
          content: content,
          userName: userName, // Save the user's name as a string
          date: Date.now()
      };

      // Push the new reply to the post's replies array
      post.replies.push(newReply);

      // Save the updated post
      await post.save();

      res.redirect('/community');
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/signin", (req, res) => {
    const messages = req.flash();
    if (messages.error !== undefined) {
        messages.error = messages.error + '. Enter valid username and password.';
    }
    res.render('signin', { messages });
});
  
app.post('/signin', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signin',
  failureFlash: true
}));
    
app.get("/goals", isAuthenticated, async (req, res) => {

  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of the day
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59); // End of the day
  console.log("startOfDay", startOfDay, "endOfDay", endOfDay); 

    // Fetch all goals of the user
    const userID = req.user._id; 
    //const userGoals = await Goal.find({ user: userID }); //change to req.user._id

    const userGoals = await Goal.find({
      date: { $gte: startOfDay, $lte: endOfDay }, // Filter by createdAt field within today
      user: req.user._id // Assuming userId is used to filter user-specific goals
    });

    // console.log("goals", userGoals); 
    res.render('goals', {userGoals: userGoals});
});

app.post("/goals", isAuthenticated, async (req, res) => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0); // Start of the day
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59); // End of the day
      console.log("startOfDay", startOfDay, "endOfDay", endOfDay); 
        // Parse the form data
        const { goalContent } = req.body;

        const userID = req.user._id;

        await Goal.create({
            content: goalContent,
            user: userID, //remove and change to req.user._id
        });

        //const userGoals = await Goal.find({ user: userID }); //change to req.user._id
        const userGoals = await Goal.find({
          date: { $gte: startOfDay, $lte: endOfDay }, // Filter by createdAt field within today
          user: req.user._id // Assuming userId is used to filter user-specific goals
        });

        console.log("goals", userGoals);
        // Render the goals template with the user's goals
        res.render('goals', { userGoals: userGoals });
    } catch (error) {
        // Handle any errors
        console.error('Error adding goal:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/goals/delete/:goalId', isAuthenticated, async (req, res) => {

const userId = req.user._id;
const goalId = req.params.goalId;
console.log("goalId: ", goalId, "userId: ", userId); 
  try {
      // Query the Event collection to find the specific event
      const goal = await Goal.findOne({ _id: goalId }).exec();
      console.log("goal: ", goal);
      if (!goal) {
          return res.status(404).send('Goal not found or you do not have permission to delete it.');
      }

      // Delete the event
      await Goal.deleteOne({ _id: goalId }).exec();

      // Redirect back to the myevents route or another appropriate route
      res.redirect('/goals');
  } catch (error) {
      console.error('Error deleting goal:', error);
      res.status(500).json({ error: 'An error occurred while deleting the goal' });
  }
});


app.post('/updateGoalStatus', isAuthenticated, async (req, res) => {
  const { goalId } = req.body;
  try {
    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    console.log("goal: ", goal);
    goal.completed = !goal.completed;
    await goal.save();
    console.log("Updated goal: ", goal);
    res.json({ success: true, completed: goal.completed });
  }
  catch (error) {
    console.error('Error updating goal status:', error);
    res.status(500).json({ error: 'An error occurred while updating the goal status' });
  }
  
});


app.get('/allGoals', isAuthenticated, async (req, res) => {
  try {
    const allGoals = await Goal.find({ user: req.user._id }).lean();
    console.log("allGoals: ", allGoals);
    res.render('allGoals', { allGoals }); 
  } catch (error) {
    console.error('Error fetching all goals:', error);
    res.status(500).json({ error: 'An error occurred while fetching all goals' });
  }
});

// Route to handle comment submission
app.post('/submitComment', isAuthenticated, async (req, res) => {
  try {
      const { comment, postId } = req.body;
      console.log("reqbody:   ", req.body); 
      // Save comment to the database
      const newComment = await Reply.create({
          content: comment,
          user: req.user._id,
          userName: req.user.name
          // Other relevant data...
      });

      //await newComment.save();
      //await newComment.save();
      let post = await Post.findById(postId); 
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
      console.log("POST FOUND: ", post); 
      
      post.replies.push(newComment);
      console.log("Post replies: ", post.replies);
      await post.save();
      // Respond with the newly created comment data
      res.json({ comment: newComment.content, userName: newComment.userName });
  } catch (error) {
      console.error('Error submitting comment:', error);
      res.status(500).send('Internal Server Error');
  }
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
    res.redirect('/');
  });
});


app.get('/goals/dailyGoals', isAuthenticated, async (req, res) => {
  try{
  const goals = await Goal.find({user: req.user._id}).lean();
  console.log("dailyGoals: ", goals);
  res.render('dailyGoals', { goals });
  } catch (error) {
      console.log(error); 
  }
});



app.listen(3000);
console.log("http://127.0.0.1:3000/");