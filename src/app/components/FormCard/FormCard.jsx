"use client";
import React, { useState, useContext, useEffect } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import { Copy, Phone, Check } from "lucide-react";
import "./FormCard.css";

const FormCard = () => {
  const [idToCall, setIdToCall] = useState("");
  const [isCopied, setIsCopied] = useState(false);


  const { name, setName, myUserId, callUser, isCallAccepted } = useContext(VideoCallContext);  

  const fetchPeerId = async (peerId) => {
    try {
      const response = await fetch("/api/client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ peerId }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Peer ID saved:", data);
    } catch (error) {
      console.error("Error saving peer ID:", error);
    }
  };

  useEffect(() => {
    if (myUserId) {
      fetchPeerId(myUserId);
    }
  }, [myUserId]); // Run only when myUserId is defined

  const handleCopyClick = () => {
    navigator.clipboard.writeText(myUserId);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  };

  return (
    <>
      {!isCallAccepted && (
        <div className="form-section">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto text-black">
            <form noValidate autoComplete="off" className="space-y-4">
              <div className="flex flex-col">
                <label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
                            
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 mb-3"
                  onClick={handleCopyClick}
                >
                  {isCopied ? (
                    <>
                      <Check size={22} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={22} /> Copy Your ID
                    </>
                  )}
                </button>              
              
              <div className="flex flex-col text-black">
                <label htmlFor="idToCall" className="text-sm font-medium text-gray-700 mb-1">
                  ID to call
                </label>
                <input
                  type="text"
                  id="idToCall"
                  value={idToCall}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setIdToCall(e.target.value)}
                  placeholder="Enter the ID to make a call"
                />
              </div>
              
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                onClick={() => callUser(idToCall)}
              >
                <Phone size={22} /> Call
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FormCard;