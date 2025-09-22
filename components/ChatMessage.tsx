import React from "react";
import { motion } from "framer-motion";

interface ChatMessageProps {
  sender: string;
  message: string;
  isOwnMessage: boolean;
}

const ChatMessage = ({ sender, message, isOwnMessage }: ChatMessageProps) => {
  const isSystemMessage = sender === "system";

  // Animation variants for different message types
  const messageVariants = {
    hidden: {
      opacity: 0,
      x: isOwnMessage ? 50 : -50,
      scale: 0.8,
    },
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 400,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  const systemMessageVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
      },
    },
  };

  if (isSystemMessage) {
    return (
      <motion.div
        variants={systemMessageVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="flex justify-center mb-4"
      >
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-4 py-2 rounded-full text-xs font-medium shadow-sm border border-gray-300/50">
          {message}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`flex flex-col ${
          isOwnMessage ? "items-end" : "items-start"
        } max-w-[85%] sm:max-w-[75%] md:max-w-[60%] lg:max-w-[50%]`}
      >
        {/* Sender name - only show for received messages */}
        {!isOwnMessage && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-xs text-gray-500 mb-1 ml-4 font-medium"
          >
            {sender}
          </motion.p>
        )}

        <div className="relative group">
          {/* Message bubble */}
          <motion.div
            whileHover={{
              boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              y: -2,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
              px-4 py-3 rounded-2xl shadow-md relative backdrop-blur-sm
              ${
                isOwnMessage
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-200/50 rounded-bl-md"
              }
              transition-all duration-200 hover:shadow-lg
            `}
          >
            {/* Message text with typing animation effect */}
            <motion.p
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-sm leading-relaxed break-words ${
                isOwnMessage ? "text-white" : "text-gray-800"
              }`}
            >
              {message}
            </motion.p>

            {/* Message tail */}
            <div
              className={`
                absolute w-3 h-3 transform rotate-45
                ${
                  isOwnMessage
                    ? "bg-blue-500 -bottom-1 -right-1"
                    : "bg-white border-l border-b border-gray-200/50 -bottom-1 -left-1"
                }
              `}
            />
          </motion.div>

          {/* Timestamp (appears on hover) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className={`
              absolute -bottom-6 text-xs text-gray-400 font-medium
              opacity-0 group-hover:opacity-100 transition-opacity duration-200
              ${isOwnMessage ? "right-0" : "left-0"}
            `}
          >
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </motion.div>
        </div>

        {/* Delivery status for own messages */}
        {isOwnMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            className="flex items-center mt-1 mr-2"
          >
            <div className="flex space-x-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0,
                }}
                className="w-1 h-1 bg-blue-400 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: 0.2,
                }}
                className="w-1 h-1 bg-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
