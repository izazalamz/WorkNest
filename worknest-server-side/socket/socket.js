const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`Joined room: ${conversationId}`);
    });

    socket.on("sendMessage", async (data) => {
      const { conversationId, senderUid, text } = data;

      if (!conversationId || !senderUid || !text) {
        console.log(" Missing socket message data", data);
        return;
      }

      const message = await Message.create({
        conversationId,
        senderUid,
        text,
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastMessageAt: new Date(),
      });

      io.to(conversationId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = socketHandler;
