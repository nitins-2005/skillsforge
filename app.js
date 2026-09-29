const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStoreLib = require("connect-mongo");
const MongoStore = MongoStoreLib.default || MongoStoreLib;
const ejsMate = require("ejs-mate");
const path = require("path");
const User = require("./models/user");
const Task = require("./models/task");
const Submission = require("./models/submission");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
const submission = require("./models/submission");
const task = require("./models/task");

const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));


app.set("view engine", "ejs");
app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));

//mongoo connection
mongoose.connect("mongodb://127.0.0.1:27017/skillsforge")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

//sessions
app.use(session({
  secret: "skillsforgesecret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
  store: MongoStore.create({
    mongoUrl: "mongodb://127.0.0.1:27017/skillsforge"
  })
}));
app.use(flash());


//middleware
//isloggedin
const isLoggedIn = (req, res, next) => {
  if (!req.session.userId) {
    // req.flash("error", "Please login first!");
    console.log("error : not logged in");
    return res.redirect("/login");
  }
  next();
};

//check user is admin or not
const isAdmin = (req, res, next) => {
  if (req.session.role != "admin") {
    // req.flash("error", "Please login first!");
    console.log("error : not admin");
    return res.redirect("/error");
  }
  next();
};


//landing page
app.get("/", (req, res) => {
  try {
    res.render("main/landing");
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  };
});

//signin
app.get("/signin", (req, res) => {
  try {
    res.render("user/signin");
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  };
});
app.post("/signin", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // req.flash("success", "Account created! Please login.");
    res.redirect("/login");
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/signin");
  }
});

//login
app.get("/login", (req, res) => {
  res.render("user/login");
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.send("no user found");
      // req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.send("wrong initials");
      // req.flash("error", "Invalid email or password");
      return res.redirect("/login");
    }


    req.session.userId = user._id;
    req.session.role = user.role;

    // req.flash("success", "Welcome back!");
    return res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    return res.redirect("/login");
  }
});

//logout
app.get("/logout", isLoggedIn, (req, res) => {
  try {
    req.session.destroy(err => {
      if (err) {
        req.flash("error", "Logout failed");
        return res.redirect("/dashboard");
      }
      res.clearCookie("connect.sid");
      // req.flash("success", "Logged out successfully");
      res.redirect("/login");
    });
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/error");
  }
});

//dashboard
app.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    if (!req.session.userId) {
      // req.flash("error", "Please login first");
      return res.redirect("/login");
    }
    const topics = await Task.distinct("topic"); //distinct gives diff values of that field
    const userId = req.session.userId;
    const users = await User.findById(userId);

    res.render("main/dashboard", { topics,users });
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/error");
  }
});

//tasks route
app.get("/tasks/:topic", isLoggedIn, async (req, res) => {
  try {
    const tasks = await Task.find({ topic: req.params.topic });
    res.render("main/task", { tasks, topic: req.params.topic });
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/error");
  }
});

//submission
app.get("/tasks/:taskId/sub", isLoggedIn, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    res.render("main/submission", { task });
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/error");
  }
})
app.post("/tasks/:taskId/sub", isLoggedIn, async (req, res) => {
  try {
    const { code, explanation } = req.body;
    const submission = new Submission({
      task: new mongoose.Types.ObjectId(req.params.taskId), //cast to ObjectId
      userId: req.session.userId,
      code,
      explanation
    });
    await submission.save();
    // req.flash("success", "Submission successful!");
    res.redirect("/dashboard");
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/error");
  }

});

//profile
app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const userId = req.session.userId;
    const users = await User.findById(userId);

    const submissions = await Submission.find({ userId: userId });//.populate("task , difficulty")

    res.render("main/profile", { users, submissions });
  } catch (err) {
    console.log(err);
  //   // req.flash("error", "Something went wrong");
    res.redirect("/error");
  };
});

//leader board
app.get("/leaderboard",isLoggedIn,async(req,res)=>{
    try{
        const users = await User.find().sort({ totalPoints: -1 }); //sort in descending order of totalPoints
        // Get the ID of the logged-in user
        const currentUserId = req.session.userId;
        res.render("main/leaderboard",{users, currentUserId});
    }catch(err){
      console.log(err);
    // req.flash("error", "Something went wrong");
        res.redirect("/error");
    }
})


//admin panel
app.get("/admin/dashboard", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const pendingSub = await Submission.find({ status: "pending" });
    res.render("admin/adminDash", { pendingSub });
  } catch (err) {
    console.log(err);
    // req.flash("error", "Something went wrong");
    res.redirect("/");
  }
})

//approve submission
app.get("/admin/:submissionId/approve", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const subId = req.params.submissionId;
    const submission = await Submission.findById(subId);
    const user = await User.findById(submission.userId);
    const task = await Task.findById(submission.task);
    res.render("admin/approve", { submission, user, task });
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  }
})
app.post("/admin/:submissionId/approve", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const subId = req.params.submissionId;
    const { marks, status, skillsEarned } = req.body;
    const marksNum = Number(marks);//convert marks to a number                 

    const submission = await Submission.findByIdAndUpdate(subId,
      { marks: marksNum, status },
      { new: true }); //new true returns the updated document
    const updatedUser = await User.findByIdAndUpdate(submission.userId,
      {
        $inc: { totalPoints: marksNum },
        $push: { skillsEarned }
      }); //inc is used to increment the total marks of user

    // console.log("updated User : ", updatedUser);
    // req.flash("success", "Submission updated!");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.log(err);
    res.redirect("/error");
  };
});


//error page
app.get("/error", (req, res) => {
  res.render("error");
})


app.listen(8080, () => {
  console.log("Server running on port 8080");
});
