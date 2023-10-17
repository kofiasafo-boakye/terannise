const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");



const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body; //other user's Id we want to have a convo with

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400).json("UserId param not sent with request");
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },//logged in user's id
      { users: { $elemMatch: { $eq: userId } } },// other person's id
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).json(error);
      throw new Error(error.message);
    }
  }
});


const fetchChats = asyncHandler(async (req, res) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).json(error);
    throw new Error(error.message);
  }
});


const createGroupChat = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = JSON.parse(req.body.users);

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).json(error);
    throw new Error(error.message);
  }
});


const renameGroup = asyncHandler(async (req, res) => {
//   const { chatId, chatName } = req.body;

//   const updatedChat = await Chat.findByIdAndUpdate(
//     chatId,
//     {
//       chatName: chatName,
//     },
//     {
//       new: true,
//     }
//   )
//     .populate("users", "-password")
//     .populate("groupAdmin", "-password");

//   if (!updatedChat) {
//     res.status(404);
//     throw new Error("Chat Not Found");
//   } else {
//     res.json(updatedChat);
//   }

    const { chatId, chatName } = req.body;

    try{
        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName,
            },
            {
                new: true,
            }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password")

        if (!updatedChat) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(updatedChat);
        }
    } catch(error){
        res.status(400).json(error);
        throw new Error(error.message);
    }

});


const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  // check if the requester is admin

  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }

    // const { chatId, userId, requesterId} = req.body;
    // // userId = id of person we want to add
    // // requesterId = id of person trying to add another person
    // try{
    //     console.log("hi")
    //     // const query = { _id: mongoose.Types.ObjectId(chatId) };
    //     const chat = await Chat.findById( chatId );
    //     console.log("chat.groupadmin", chat.groupAdmin.toString())
    //     if(requesterId === chat.groupAdmin.toString()){
                
    //             const added = await Chat.findByIdAndUpdate(
    //             chatId,
    //             {
    //             $push: { users: userId },
    //             },
    //             {
    //             new: true,
    //             }
    //         )
    //             .populate("users", "-password")
    //             .populate("groupAdmin", "-password");

    //         if (!added) {
    //             res.status(404);
    //             throw new Error("Chat Not Found");
    //         } else {
    //             res.json(added);
    //         }
    //     }else{
    //         res.status(404).send("You are not the admin")
    //     }
        
    // }catch(error){
    //     res.status(400).json(error)        
    // }
});


const removeFromGroup = asyncHandler(async (req, res) => {

  const { chatId, userId } = req.body;

  // check if the requester is admin

  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }

    // const { chatId, userId, requesterId} = req.body;
    // // userId = id of person we want to add
    // // requesterId = id of person trying to add another person


    // try{
    //     const chat = await Chat.findById( chatId );
    //     if(requesterId === chat.groupAdmin.toString()){
    //             const removed = await Chat.findByIdAndUpdate(
    //             chatId,
    //             {
    //             $pull: { users: userId },
    //             },
    //             {
    //             new: true,
    //             }
    //         )
    //             .populate("users", "-password")
    //             .populate("groupAdmin", "-password");

    //         if (!removed) {
    //             res.status(404);
    //             throw new Error("Chat Not Found");
    //         } else {
    //             res.json(removed);
    //             console.log("removed successfully")
    //         }
    //     }else{
    //         res.status(404).send("You are not the admin")
    //     }
        
    // }catch(error){
    //     res.status(400).json(error)        
    // }
  
});



module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
// module.exports = {
//   accessChat,
//   fetchChats,
//   createGroupChat,
//   renameGroup,
//   addToGroup,
//   removeFromGroup,
// };
