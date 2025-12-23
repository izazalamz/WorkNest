import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import socket from "../../utils/socket";
import { AuthContext } from "../../contexts/AuthContext";

const EmployeeSupportChat = () => {
  const { user } = useContext(AuthContext);

  const [adminUid, setAdminUid] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch active admin UID

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/admin");
        setAdminUid(res.data.uid);
      } catch (error) {
        console.error("Failed to fetch admin:", error);
      }
    };

    fetchAdmin();
  }, []);

  /* -----------------------------------------
     Create / fetch conversation
  ----------------------------------------- */
  useEffect(() => {
    if (!user?.uid || !adminUid) return;

    const initChat = async () => {
      try {
        const res = await axios.post(
          "http://localhost:3000/chat/conversation",
          {
            employeeUid: user.uid,
            adminUid,
          }
        );

        const convId = res.data.conversation._id;
        setConversationId(convId);

        const msgRes = await axios.get(
          `http://localhost:3000/chat/messages/${convId}`
        );

        setMessages(msgRes.data || []);

        socket.emit("joinConversation", convId);
      } catch (error) {
        console.error("Chat init failed:", error);
      }
    };

    initChat();
  }, [user?.uid, adminUid]);

  /* -----------------------------------------
     Listen for incoming messages
  ----------------------------------------- */
  useEffect(() => {
    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  /* -----------------------------------------
     Auto-scroll to latest message
  ----------------------------------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* -----------------------------------------
     Send message
  ----------------------------------------- */
  const sendMessage = () => {
    if (!text.trim() || !conversationId) return;

    socket.emit("sendMessage", {
      conversationId,
      senderUid: user.uid,
      text,
    });

    setText("");
  };

  /* -----------------------------------------
     UI
  ----------------------------------------- */
  return (
    <div className="w-full max-w-md mx-auto bg-card border border-border rounded-xl flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-border font-semibold">
        Support Chat
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
              msg.senderUid === user.uid
                ? "ml-auto bg-primary text-white"
                : "bg-muted text-foreground"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your issue..."
          className="flex-1 h-10 px-3 rounded-lg border border-border bg-background outline-none focus:ring-2 focus:ring-primary/50"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default EmployeeSupportChat;
