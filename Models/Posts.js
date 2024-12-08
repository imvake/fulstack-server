import mongoose from "mongoose";
const PostsSchema = mongoose.Schema(
  {
    postMsg: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    lat: {
      type: Number,
    },
    lang: {
      type: Number,
    },

    likes: {
      count: {
        type: String,
        default: 0,
      },
      users: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const PostModel = mongoose.model("Posts", PostsSchema, "Posts");
export default PostModel;
