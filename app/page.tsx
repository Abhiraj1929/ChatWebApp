"use client";

import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/socketClient";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<
    { sender: string; message: string; id: string }[]
  >([]);
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Named functions for proper cleanup
    const handleMessage = (data: { sender: string; message: string }) => {
      const messageWithId = { ...data, id: `${Date.now()}-${Math.random()}` };
      setMessages((prev) => [...prev, messageWithId]);
    };

    const handleUserJoined = (message: string) => {
      const systemMessage = {
        sender: "system",
        message,
        id: `system-${Date.now()}-${Math.random()}`,
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    // Register event listeners
    socket.on("message", handleMessage);
    socket.on("user_joined", handleUserJoined);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Cleanup function with named functions
    return () => {
      socket.off("message", handleMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const handleJoinRoom = () => {
    if (room.trim() && userName.trim()) {
      socket.emit("join-room", {
        room: room.trim(),
        username: userName.trim(),
      });
      setJoined(true);
    }
  };

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      // Remove manual message addition - let socket event handle it
      socket.emit("message", {
        room,
        message: message.trim(),
        sender: userName,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="flex justify-center w-full">
        <AnimatePresence mode="wait">
          {!joined ? (
            <motion.div
              key="join-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Join Chat Room
                  </h1>
                  <p className="text-gray-600">
                    Enter your details to get started
                  </p>
                </motion.div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter room name"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200"
                      onKeyPress={(e) => e.key === "Enter" && handleJoinRoom()}
                    />
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                    disabled={!room.trim() || !userName.trim()}
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Join Room
                  </motion.button>
                </div>

                <div className="flex items-center justify-center mt-6 space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {isConnected ? "Connected" : "Connecting..."}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chat-room"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-4xl mx-auto h-[calc(100vh-4rem)]"
            >
              <div className="bg-white rounded-2xl shadow-xl h-full flex flex-col overflow-hidden">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex items-center justify-between"
                >
                  <div>
                    <h1 className="text-xl font-bold">Room: {room}</h1>
                    <p className="text-blue-100 text-sm">
                      Welcome, {userName}!
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isConnected ? "bg-green-400" : "bg-red-400"
                      }`}
                    ></div>
                    <span className="text-sm text-blue-100">
                      {isConnected ? "Online" : "Offline"}
                    </span>
                  </div>
                </motion.div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                  <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        layout
                        transition={{
                          type: "spring",
                          damping: 25,
                          stiffness: 500,
                          duration: 0.3,
                        }}
                      >
                        <ChatMessage
                          sender={msg.sender}
                          message={msg.message}
                          isOwnMessage={msg.sender === userName}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {messages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-gray-500 mt-8"
                    >
                      <p className="text-lg">No messages yet</p>
                      <p className="text-sm">Start the conversation!</p>
                    </motion.div>
                  )}
                </div>

                {/* Chat Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-white border-t border-gray-200"
                >
                  <ChatForm onSendMessage={handleSendMessage} />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
