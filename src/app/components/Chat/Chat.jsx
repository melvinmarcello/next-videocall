"use client";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Send, Smile } from "lucide-react";
import Picker from "emoji-picker-react";
import "./Chat.css";

const ChatModal = ({
  isVisible,
  toggleModal,
  chatMessages,
  sendMessage,
  setSendMessage,
  onSearch,
  receivedMessage,
}) => {
  const messagesEndRef = useRef(null);
  const notificationSound = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isVisible) {
      scrollToBottom();
    }

    if (receivedMessage.text && !isVisible) {
      if (notificationSound.current) {
        notificationSound.current.play();
      }

      toast.info(`${receivedMessage.text}`, Send, {
      
      });
    }
  }, [receivedMessage, isVisible]);

  const handleSend = () => {
    if (sendMessage.trim()) {
      onSearch(sendMessage);
      setSendMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    setSendMessage((prevMessage) => prevMessage + emojiObject.emoji);
  };

  if (!isVisible) return null;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        toastClassName="custom-toast"
      />
      <audio src="@/assets/notification.mp3" ref={notificationSound} />
      
      {/* Modal backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        {/* Modal container */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 flex flex-col z-50">
          {/* Modal header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Chat</h3>
            <button 
              onClick={() => {
                toggleModal(false);
                setShowEmojiPicker(false);
              }}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <BsX size={24} />
            </button>
          </div>
          
          {/* Modal body */}
          <div 
            className="flex-grow p-4 overflow-y-auto max-h-96"
            onClick={() => setShowEmojiPicker(false)}
          >
            {chatMessages.length ? (
              <div className="message">
                {chatMessages.map((message, index) => (
                  <React.Fragment key={index}>
                    <div
                      className={
                        message.type === "sent"
                          ? "message-sent"
                          : "message-reciever"
                      }
                    >
                      {message.message}
                    </div>
                  </React.Fragment>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <span>No messages here</span>
              </div>
            )}
          </div>
          
          {/* Modal footer */}
          <div className="border-t p-4">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Send a message"
                className="w-full rounded-full border border-gray-300 pl-4 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={sendMessage}
                onChange={(e) => setSendMessage(e.target.value)}
                onClick={() => setShowEmojiPicker(false)}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute right-12">
                <Smile
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                  size={24}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                />
              </div>
              <div className="absolute right-2">
                <button 
                  onClick={handleSend}
                  className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 focus:outline-none"
                >
                  <Send className="text-white" size={16} />
                </button>
              </div>
              {showEmojiPicker && (
                <div className="absolute bottom-12 right-0">
                  <Picker
                    searchDisabled={true}
                    height={310}
                    width={310}
                    emojiStyle="google"
                    onEmojiClick={handleEmojiSelect}
                    className="emoji"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatModal;