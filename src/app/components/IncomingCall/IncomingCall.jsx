"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import { Phone, PhoneCall, PhoneOff, X } from "lucide-react";


const IncomingCall = () => {
  const {
    receiveCall,
    call,
    isCallAccepted,
    endIncomingCall,
    setPartnerUserId,
  } = useContext(VideoCallContext);
  const [showModal, setShowModal] = useState(false);
  const audioRef = useRef();

  const handleClose = () => {
    setShowModal(false);
    if (call.isReceivingCall && !isCallAccepted) {
      endIncomingCall();
    }
    window.location.reload();
  };

  const handleCallAnswer = () => {
    receiveCall();
    setShowModal(false);
  };

  useEffect(() => {
    if (call.isReceivingCall && !isCallAccepted) {
      setShowModal(true);
      setPartnerUserId(call.from);
    }
  }, [call.from, call.isReceivingCall, isCallAccepted, setPartnerUserId]);

  useEffect(() => {
    if (showModal && audioRef.current) {
      audioRef.current.play();
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [showModal]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-8 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden w-full max-w-sm mx-4 transform transition-all animate-in fade-in duration-300">
        {/* Header with avatar */}
        <div className="bg-blue-600 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-white rounded-full h-12 w-12 flex items-center justify-center text-blue-600">
              <PhoneCall size={24} />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-white">
                Customer Service is calling
              </h3>
              <p className="text-blue-100 text-sm">
                Incoming call
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-blue-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Call timer */}
        <div className="px-4 py-3 bg-blue-50 dark:bg-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Calling...
          </p>
        </div>
        
        {/* Call actions */}
        <div className="px-4 py-3 flex justify-center space-x-6">
          <button 
            onClick={handleClose}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors"
          >
            <PhoneOff size={24} />
          </button>
          <button
            onClick={handleCallAnswer}
            className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 flex items-center justify-center transition-colors animate-pulse"
          >
            <Phone size={24} />
          </button>
        </div>
      </div>
    </div>    
  );
};

export default IncomingCall;