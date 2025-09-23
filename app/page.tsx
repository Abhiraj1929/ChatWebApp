"use client";

import ChatForm from "@/components/ChatForm";
import ChatMessage from "@/components/ChatMessage";
import { socket } from "@/lib/socketClient";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: string;
  message: string;
  id: string;
  timestamp?: Date;
}

export default function Home() {
  const [room, setRoom] = useState("");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check initial connection status
    setIsConnected(socket.connected);

    // Named functions for proper cleanup
    const handleMessage = (data: { sender: string; message: string }) => {
      const messageWithId: Message = {
        ...data,
        id: `${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, messageWithId]);
    };

    const handleUserJoined = (message: string) => {
      const systemMessage: Message = {
        sender: "system",
        message,
        id: `system-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    const handleUserLeft = (message: string) => {
      const systemMessage: Message = {
        sender: "system",
        message,
        id: `system-${Date.now()}-${Math.random()}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    };

    const handleRoomJoined = (data: { room: string; users: string[] }) => {
      setOnlineUsers(data.users || []);
      const welcomeMessage: Message = {
        sender: "system",
        message: `Welcome to room "${data.room}"!`,
        id: `welcome-${Date.now()}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, welcomeMessage]);
      setIsLoading(false);
    };

    const handleUsersUpdate = (users: string[]) => {
      setOnlineUsers(users);
    };

    const handleConnect = () => {
      setIsConnected(true);
      console.log("Connected to server");
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log("Disconnected from server");
    };

   const handleConnectError = (
     error: Error | { message: string } | unknown
   ) => {
     console.error("Connection error:", error);
     setIsConnected(false);
     setIsLoading(false);
   };


    // Register event listeners
    socket.on("message", handleMessage);
    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);
    socket.on("room_joined", handleRoomJoined);
    socket.on("users_update", handleUsersUpdate);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    // Cleanup function
    return () => {
      socket.off("message", handleMessage);
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
      socket.off("room_joined", handleRoomJoined);
      socket.off("users_update", handleUsersUpdate);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
    };
  }, []);

  const handleJoinRoom = () => {
    if (room.trim() && userName.trim() && isConnected) {
      setIsLoading(true);
      socket.emit("join-room", {
        room: room.trim(),
        username: userName.trim(),
      });
      setJoined(true);
    }
  };

  const handleSendMessage = (message: string) => {
    if (message.trim() && isConnected) {
      socket.emit("message", {
        room,
        message: message.trim(),
        sender: userName,
      });
    }
  };

  const handleLeaveRoom = () => {
    socket.emit("leave-room", { room, username: userName });
    setJoined(false);
    setMessages([]);
    setOnlineUsers([]);
    setRoom("");
    setUserName("");
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
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">💬</span>
                  </div>
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
                      disabled={isLoading}
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
                      disabled={isLoading}
                    />
                  </motion.div>

                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    onClick={handleJoinRoom}
                    disabled={
                      !room.trim() ||
                      !userName.trim() ||
                      !isConnected ||
                      isLoading
                    }
                    className="w-full px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold shadow-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Joining...
                      </>
                    ) : (
                      "Join Room"
                    )}
                  </motion.button>
                </div>

                <div className="flex items-center justify-center mt-6 space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
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
              className="w-full max-w-6xl mx-auto h-[calc(100vh-4rem)]"
            >
              <div className="bg-white rounded-2xl shadow-xl h-full flex overflow-hidden">
                {/* Sidebar with online users */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col"
                >
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">
                      Online Users
                    </h3>
                    <p className="text-sm text-gray-500">
                      {onlineUsers.length} online
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    {onlineUsers.map((user, index) => (
                      <motion.div
                        key={user}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center space-x-2 py-2 px-3 rounded-lg mb-2 ${
                          user === userName
                            ? "bg-blue-100 border border-blue-200"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span
                          className={`text-sm ${
                            user === userName
                              ? "font-semibold text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {user} {user === userName && "(You)"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <button
                      onClick={handleLeaveRoom}
                      className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Leave Room
                    </button>
                  </div>
                </motion.div>

                {/* Main chat area */}
                <div className="flex-1 flex flex-col">
                  {/* Header */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <h1 className="text-xl font-bold">#{room}</h1>
                      <p className="text-blue-100 text-sm">
                        Welcome, {userName}!
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isConnected
                            ? "bg-green-400 animate-pulse"
                            : "bg-red-400"
                        }`}
                      ></div>
                      <span className="text-sm text-blue-100">
                        {isConnected ? "Online" : "Offline"}
                      </span>
                    </div>
                  </motion.div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
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
                          <div className="text-6xl mb-4">💬</div>
                          <p className="text-lg font-medium">No messages yet</p>
                          <p className="text-sm">Start the conversation!</p>
                        </motion.div>
                      )}

                      {/* Scroll anchor */}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Chat Form */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-white border-t border-gray-200"
                  >
                    <ChatForm
                      onSendMessage={handleSendMessage}
                      disabled={!isConnected}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
