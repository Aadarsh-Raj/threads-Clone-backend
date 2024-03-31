const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      require: true,
    },
    userName: {
      type: String,
      require: true,
      unique: true,
    },
    email: {
      type: String,
      require: true,
      unique: true,
      sparse:true
    },
    password: {
      type: String,
      require: true,
    },
    phoneNumber: {
      type: String,
      require: false,
    },
    profileDescription: {
      type: String,
      require: false,
    },
    followers: {
      type: [],
      require: false,
      default: [],
    },
    following: {
      type: [],
      require: false,
      default: [],
    },
    threads: {},
    replies: {},
    reposts: {},
    otherLinks: {
      type: [],
      require: false,
    },
    privateAccount: {
      type: Boolean,
      require: true,
      default: true,
    },
    profileImage: {
      data: Buffer,
      contentType: String,
    },
    token: {
      type: String,
      require: false,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", function () {
  const salt = bcrypt.genSaltSync(10);
  console.log(this.password);
  const hash = bcrypt.hashSync(this.password, salt);
  this.password = hash;
});

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
