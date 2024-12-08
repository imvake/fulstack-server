import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import UserModel from "./Models/Users.js";
import PostModel from "./Models/Posts.js";
import bcrypt from "bcrypt";

const app = express();
app.use(cors());
app.use(express.json());

const connectionString = `mongodb+srv://admin:admin@progclub.m3mdonr.mongodb.net/PostApp?retryWrites=true&w=majority&appName=progclub`;

mongoose
  .connect(connectionString)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.post("/insertUser", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      res.send("User Exist !!!");
    } else {
      const hash = await bcrypt.hash(req.body.password, 10);
      const newuser = new UserModel({
        uname: req.body.uname,
        password: hash,
        email: req.body.email,
        pic: req.body.pic,
      });
      await newuser.save();
      res.send("User inserted successfully");
      console.log("User Added");
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(500).json({
        message: "User Not Found",
      });
    } else {
      const match = await bcrypt.compare(req.body.password, user.password);
      if (match) {
        return res.status(200).json({
          user: user,
          message: "Success",
        });
      } else {
        return res.status(401).json({
          message: "Invalid Credentials",
        });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: error,
    });
  }
});

app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.send(users);
  } catch (error) {
    console.log(error);
  }
});

// for posts

app.post("/savePost", async (req, res) => {
  try {
    const newpost = new PostModel({
      postMsg: req.body.message,
      email: req.body.email,
      lat: req.body.lat,
      lang: req.body.lang,
    });
    await newpost.save();
    res.send({
      post: newpost,
      message: "posted",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
});

app.get("/getPosts", async (req, res) => {
  try {
    const postsWithUser = await PostModel.aggregate([
      {
        $lookup: {
          from: "Users",
          localField: "email",
          foreignField: "email",
          as: "users",
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          "users.password": 0,
          "users.email": 0,
        },
      },
    ]);
    res.json({ posts: postsWithUser });
  } catch (err) {
    res.status(500).json({ massage: err });
  }
});

app.put("/updatePost", async (req, res) => {
  try {
    const postMsg = req.body.postMsg;
    const postId = req.body.postId;

    const post = await PostModel.findOne({ _id: postId });
    post.postMsg = postMsg;
    await post.save();
    res.send({
      post: post,
      message: "post Updated",
    });
  } catch (error) {
    res.status(500).json({
      message: error,
    });
  }
});

app.delete("/deletePost/:postId", async (req, res) => {
  try {
    const postId = req.params.postId;

    const delPost = await PostModel.findOneAndDelete({ _id: postId });
    if (delPost) {
      res.send({
        message: "post Deleted",
      });
    } else {
      res.send({
        message: "post not Deleted",
      });
    }
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

app.listen(8080, () => {
  console.log(`Server is running on http://localhost:8080`);
});
