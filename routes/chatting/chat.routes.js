import { Router } from "express";
import {
  addNewParticipantInGroupChat,
  createAGroupChat,
  createOrGetAOneOnOneChat,
  deleteGroupChat,
  deleteOneOnOneChat,
  getAllChats,
  getGroupChatDetails,
  leaveGroupChat,
  removeParticipantFromGroupChat,
  renameGroupChat,
  searchAvailableUsers,
} from "../../controllers/chatting/chat.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import {
    createAGroupChatValidator,
    updateGroupChatNameValidator,
  } from "../../../validators/";