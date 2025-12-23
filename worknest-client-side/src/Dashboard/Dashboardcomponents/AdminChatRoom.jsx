import { useEffect, useState, useContext } from "react";
import axios from "axios";
import socket from "../../utils/socket";
import { AuthContext } from "../../contexts/AuthContext";

const AdminChatRoom = () => {
  const { user } = useContext(AuthContext); // admin
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  // Fetch admin conversations
  useEffect(() => {
    if (!user) return;

    axios
      .get(`http://localhost:3000/chat/admin/${user.uid}`)
      .then((res) => setConversations(res.data))
      .catch(console.error);
  }, [user]);

  // Join room + load messages
  useEffect(() => {
    if (!activeConversation) return;

    socket.emit("joinConversation", activeConversation._id);

    axios
      .get(`http://localhost:3000/chat/messages/${activeConversation._id}`)
      .then((res) => setMessages(res.data))
      .catch(console.error);
  }, [activeConversation]);

  // Listen for realtime messages
  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      if (msg.conversationId === activeConversation?._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receiveMessage");
  }, [activeConversation]);

  const sendMessage = () => {
    if (!text.trim() || !activeConversation) return;

    socket.emit("sendMessage", {
      conversationId: activeConversation._id,
      senderUid: user.uid,
      text,
    });

    setText("");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] rounded-2xl border border-border bg-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 border-r border-border">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold">Support Inbox</h2>
          <p className="text-sm text-muted-foreground">
            Employee conversations
          </p>
        </div>

        <div className="overflow-y-auto">
          {conversations.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">
              No conversations yet
            </p>
          )}

          {conversations.map((conv) => {
            const employee = conv.participants.find(
              (p) => p.role === "employee"
            )?.user;

            return (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border transition ${
                  activeConversation?._id === conv._id
                    ? "bg-muted"
                    : "hover:bg-muted/50"
                }`}
              >
                {/* Avatar */}
                <img
                  src={employee?.photoURL || "/avatar.png"}
                  alt={employee?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* Info */}
                <div className="flex-1">
                  <p className="font-medium leading-none">
                    {employee?.name || "Unknown Employee"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center gap-3">
              {(() => {
                const employee = activeConversation.participants.find(
                  (p) => p.role === "employee"
                )?.user;

                return (
                  <>
                    <img
                      src={employee?.photoURL || "/avatar.png"}
                      alt={employee?.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">
                        {employee?.name || "Employee"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Support Conversation
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 space-y-4 overflow-y-auto bg-muted/10">
              {messages.map((msg) => {
                const isAdmin = msg.senderUid === user.uid;

                return (
                  <div
                    key={msg._id}
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                      isAdmin ? "ml-auto bg-primary text-white" : "bg-muted"
                    }`}
                  >
                    {msg.text}
                  </div>
                );
              })}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background flex gap-3">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your reply..."
                className="flex-1 rounded-xl border border-primary/40 px-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:opacity-90 transition"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <p className="text-lg font-medium">No conversation selected</p>
            <p className="text-sm">Choose a conversation from the sidebar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminChatRoom;
