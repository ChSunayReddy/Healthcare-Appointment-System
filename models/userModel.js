const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  message: String,
  onClickPath: String,
  isRead: {
    type: Boolean,
    default: false
  }
});
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type: Boolean,
        default: true,
    },
    isDoctor :{
        type: Boolean,
        default: false,
    },
    isAdmin :{
        type: Boolean,
        default: false,
    },
    seenNotifications:{
        type: [notificationSchema],
        default: [],
    },
    unseenNotifications:{
        type: [notificationSchema],
        default: [],
    },

},{
    timestamps:true
})
const userModel=mongoose.model("users",userSchema);
module.exports=userModel;