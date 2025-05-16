"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import { Mic, MicOff, Camera, CameraOff, PhoneOff, MessageCircle, Share, User, Volume2, Video as VideoIcon } from "lucide-react";
import { Avatar } from "antd";
import { socket } from "@/app/config/config";
import Loading from "@/app/components/Loading/Loading";
import ChatModal from "@/app/components/Chat/Chat";

const VideoClient = () => {
  const {
    call,
    isCallAccepted,
    myVideoRef,
    partnerVideoRef,
    userStream,
    name,
    isCallEnded,
    sendMessage: sendMessageFunc,
    receivedMessage,
    chatMessages,
    setChatMessages,
    endCall,
    opponentName,
    isMyVideoActive,
    isPartnerVideoActive,
    toggleVideo,
    isMyMicActive,
    isPartnerMicActive,
    toggleMicrophone,
    toggleFullScreen,
    toggleScreenSharingMode,
    hasVideoPermission,
  } = useContext(VideoCallContext);
    
  const [sendMessage, setSendMessage] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [isLocalVideoPlaying, setIsLocalVideoPlaying] = useState(false);
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(false);
  
  // Create a local reference to track playback state
  const localVideoPlayingRef = useRef(false);
  useEffect(() => {
    handleControlPanel();
  }, [])

  // Handle incoming messages
  useEffect(() => {
    const handleMessage = ({ message, senderName }) => {
      const newMessage = {
        message,
        type: "received",
        senderName,
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, newMessage]);
      if (!isModalVisible) {
        setHasUnreadMessages(true);
      }
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [setChatMessages, isModalVisible]);

  // Monitor self video status
  useEffect(() => {
    if (userStream && myVideoRef.current) {
      // Ensure the video element has the correct stream
      if (myVideoRef.current.srcObject !== userStream) {
        console.log("Setting user stream to video element");
        myVideoRef.current.srcObject = userStream;
      }
      
      // Check if video is already playing
      if (!localVideoPlayingRef.current) {
        // Try to play the video
        const playPromise = myVideoRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Local video playing successfully");
              setIsLocalVideoPlaying(true);
              localVideoPlayingRef.current = true;
            })
            .catch(error => {
              console.error("Error playing local video:", error);
              // User interaction needed to play video
            });
        }
      }
    }
  }, [userStream, isMyVideoActive]);
  
  // Handle partner video
  useEffect(() => {
    if (isCallAccepted && partnerVideoRef.current && partnerVideoRef.current.srcObject) {
      console.log("Partner video source exists, attempting to play");
      partnerVideoRef.current.play().catch(err => {
        console.error("Error playing partner video:", err);
      });
    }
  }, [isCallAccepted, isPartnerVideoActive]);

  // Helper function to force play videos on user interaction
  const forcePlayVideos = () => {
    if (myVideoRef.current && myVideoRef.current.srcObject && !localVideoPlayingRef.current) {
      myVideoRef.current.play()
        .then(() => {
          setIsLocalVideoPlaying(true);
          localVideoPlayingRef.current = true;
        })
        .catch(err => console.error("Error playing local video:", err));
    }
    
    if (isCallAccepted && partnerVideoRef.current && partnerVideoRef.current.srcObject) {
      partnerVideoRef.current.play().catch(err => console.error("Error playing partner video:", err));
    }
  };

  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setHasUnreadMessages(false);
    }
    // When modal is toggled, try to force play videos
    forcePlayVideos();
  };

  const onSearch = (message) => {
    if (message) {
      sendMessageFunc(message);
      setSendMessage("");
    }
  };

  // Handle video toggle with additional check
  const handleVideoToggle = () => {
    const result = toggleVideo();
    forcePlayVideos();
    return result;
  };

  const handleControlPanel = () => {
      setIsControlPanelVisible(true);
    setTimeout(() => {
        setIsControlPanelVisible(false);
    }, 5000);
  }

  return (    
    <div className="video-call-container bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen w-full" onClick={handleControlPanel}>
      <div className=" mx-auto">
        {/* Video grid layout */}
        <div 
          className="video-grid flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)]"
          onClick={forcePlayVideos}
        >
          {userStream ? (
            <div className={`top-5 right-5 z-50 overflow-hidden shadow-lg transition-all duration-300 ease-in-out ${
              isCallAccepted ? 'md:w-full h-[calc(50vw-60px)] md:h-full absolute rounded-lg' : 'w-full min-h-screen'
            }`}>
              {/* Local Video Container */}
              <div className="h-full w-full bg-gray-800 relative">
                {hasVideoPermission ? (
                  <video
                    playsInline                    
                    muted
                    ref={myVideoRef}
                    onClick={(e) => toggleFullScreen(e)}
                    autoPlay
                    className="h-full w-full object-cover"
                    style={{ opacity: isMyVideoActive ? 1 : 0 }}
                  />
                ) : (
                  <div className="bg-gray-800 h-full w-full flex items-center justify-center">
                    <div className="text-center p-4 rounded-lg bg-gray-900 bg-opacity-50">
                      <Camera className="text-gray-400 mx-auto mb-2" size={32} />
                      <p className="text-white text-sm">Camera permission denied</p>
                    </div>
                  </div>
                )}
                
                {/* Avatar overlay when video is off */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isMyVideoActive && hasVideoPermission ? "opacity-0" : "opacity-100"
                }`}>
                  <div className="bg-gray-700 rounded-full p-8 shadow-lg">
                    <CameraOff
                      size={80}
                      icon={!name && <User size={42} />}
                      className="text-gray-300"
                    >
                      {name?.[0]?.toUpperCase()}
                    </CameraOff>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  {!isMyMicActive && (
                    <div className="bg-red-500 bg-opacity-85 p-1.5 rounded-md">
                      <MicOff className="text-white" size={18} />
                    </div>
                  )}
                  {!isMyVideoActive && hasVideoPermission && (
                    <div className="bg-red-500 bg-opacity-85 p-1.5 rounded-md">
                      <CameraOff className="text-white" size={18} />
                    </div>
                  )}
                </div>              
                
                {/* User name tag */}
                <div className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
                  <p className="text-white text-sm font-medium">{name || "You"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loading />
            </div>
          )}
          
          {/* Partner video */}
          {isCallAccepted && !isCallEnded && (
            <div className="relative overflow-hidden shadow-lg md:w-1/2 min-h-screen">
              <div className="h-full w-full bg-gray-800 relative">
                <video
                  playsInline
                  ref={partnerVideoRef}
                  onClick={(e) => {
                    toggleFullScreen(e);
                    forcePlayVideos();
                  }}
                  autoPlay
                  className="h-full w-full object-cover"
                  style={{ opacity: isPartnerVideoActive ? 1 : 0 }}
                />
                
                {/* Avatar overlay when partner video is off */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                  isPartnerVideoActive ? "opacity-0" : "opacity-100"
                }`}>
                  <div className="bg-gray-700 rounded-full p-8 shadow-lg">
                    <CameraOff
                      size={80}
                      icon={!opponentName && !call.name && <User size={42} />}
                      className="text-gray-300"
                    >
                      {(opponentName || call.name)?.slice(0, 1).toUpperCase()}
                    </CameraOff>
                  </div>
                </div>
                
                {/* Status indicators */}
                <div className="absolute top-3 right-3 flex space-x-2">
                  {!isPartnerMicActive && (
                    <div className="bg-red-500 bg-opacity-85 p-1.5 rounded-md">
                      <MicOff className="text-white" size={18} />
                    </div>
                  )}
                  {!isPartnerVideoActive && (
                    <div className="bg-red-500 bg-opacity-85 p-1.5 rounded-md">
                      <CameraOff className="text-white" size={18} />
                    </div>
                  )}
                </div>
                
                {/* Partner name tag */}
                <div className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-70 px-3 py-1 rounded-md">
                  <p className="text-white text-sm font-medium">{call.name || opponentName || "Customer Service"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control panel */}
        {userStream && isControlPanelVisible && (
          <div className="fixed z-50 bottom-12 left-0 right-0 flex items-center justify-center z-10 animate-fade-in transition-opacity duration-1000">
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 bg-gray-900 bg-opacity-85 backdrop-blur-sm px-4 py-3 sm:px-6 sm:py-4 rounded-full shadow-lg">
              {/* Mic toggle button */}
              <button 
                onClick={toggleMicrophone} 
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${
                  isMyMicActive ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                } rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}
                aria-label={isMyMicActive ? "Mute microphone" : "Unmute microphone"}
              >
                {isMyMicActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              {/* Camera toggle button */}
              <button 
                onClick={handleVideoToggle} 
                className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${
                  !hasVideoPermission ? 'bg-gray-500 cursor-not-allowed' : 
                  isMyVideoActive ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
                } rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200`}
                disabled={!hasVideoPermission}
                aria-label={isMyVideoActive ? "Turn off camera" : "Turn on camera"}
              >
                {isMyVideoActive ? <Camera size={20} /> : <CameraOff size={20} />}
              </button>
              
              {/* Screen sharing button (only during call) */}
              {isCallAccepted && !isCallEnded && (
                <button
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                  onClick={toggleScreenSharingMode}
                  aria-label="Share screen"
                >
                  <Share size={20} />
                </button>
              )}
              
              {/* Chat button (only during call) */}
              {isCallAccepted && !isCallEnded && (
                <button 
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 relative"
                  onClick={toggleModal}
                  aria-label="Open chat"
                >
                  <MessageCircle size={20} />
                  {hasUnreadMessages && (
                    <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              )}
              
              {/* End call button (only during call) */}
              {isCallAccepted && !isCallEnded && (
                <button 
                  className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
                  onClick={endCall}
                  aria-label="End call"
                >
                  <PhoneOff size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat modal - moved outside the control panel div */}
      {userStream && (
        <ChatModal
          isVisible={isModalVisible}
          toggleModal={toggleModal}
          chatMessages={chatMessages}
          sendMessage={sendMessage}
          setSendMessage={setSendMessage}
          onSearch={onSearch}
          receivedMessage={receivedMessage}
        />
      )}
    </div>
  );
};

export default VideoClient;