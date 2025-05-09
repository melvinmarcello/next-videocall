"use client";

import React, { useContext, useState, useEffect, useRef } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import { PhoneCall, PhoneOff, X } from "lucide-react";


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
    <>
      {/* <audio src="../../assets/ringtone.ogg" loop ref={audioRef} /> */}
      
      {/* Modal backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        {/* Modal container */}
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 flex flex-col z-50">
          {/* Modal header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">
              {call.name ? call.name : "Someone"} is calling:
            </h3>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Modal footer */}
          <div className="p-4 flex items-center justify-between">
            <button 
              onClick={handleClose} 
              className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3 focus:outline-none transition duration-200"
            >
              <PhoneOff size={25} />
            </button>
            
            <div 
              className="cursor-pointer transition-transform hover:scale-105" 
              onClick={handleCallAnswer}
            >
              <PhoneCall size={25} className="text-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IncomingCall;