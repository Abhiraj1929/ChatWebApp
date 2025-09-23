"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const ChatForm = ({
  onSendMessage,
  disabled = false,
}: {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "" && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <div className="flex-1">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder={disabled ? "Connecting..." : "Type your message here..."}
          disabled={disabled}
        />
      </div>
      <motion.button
        type="submit"
        disabled={!message.trim() || disabled}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        className="px-6 py-3 text-white rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
      >
        Send
      </motion.button>
    </form>
  );
};

export default ChatForm;
