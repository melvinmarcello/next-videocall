"use client";
import React, { useContext, useState, useEffect, useRef } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import { Mic, MicOff, Camera, CameraOff, PhoneOff, MessageCircle, Share, User, Volume2, Video as VideoIcon } from "lucide-react";
import { Avatar } from "antd";
import { socket } from "../../config/config";
import Loading from "../Loading/Loading";
import ChatModal from "../Chat/Chat";

const Video = () => {
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
  
  // Create a local reference to track playback state
  const localVideoPlayingRef = useRef(false);
  
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
    // Debug logs
    
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
              // Try again with a user interaction              
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

  return (
    <>
      <div className="video-container h-screen w-screen bg-gray-800 p-4" onClick={forcePlayVideos}>
        <div className="flex w-full justify-evenly items-center gap-4 mb-4 text-white font-medium text-lg">
          <p className="w-full text-start">You</p>
          <p className="w-full ">Customer</p>
        </div>
        <div className="flex flex-col md:flex-row w-full justify-center items-center gap-4">
          {userStream ? (
            <div className={`cs-camera w-1/2`}>
              <div className="">                
                <div className="relative flex justify-center items-center">
                  {hasVideoPermission ? (
                    <video
                      playsInline
                      muted
                      ref={myVideoRef}
                      onClick={(e) => {
                        toggleFullScreen(e);
                        forcePlayVideos();
                      }}
                      autoPlay
                      className={`rounded-md w-full object-cover`}
                      style={{ opacity: isMyVideoActive ? 1 : 0 }}
                    />
                  ) : (
                    <div className="bg-gray-700 w-full aspect-video rounded-md flex items-center justify-center">
                      <p className="text-white text-sm">Camera permission denied</p>
                    </div>
                  )}
                  {!isMyVideoActive && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mx-auto bg-gray-300 w-24 h-24 rounded-full flex items-center justify-center border-2 border-gray-500">
                      <CameraOff
                          size={45}
                          style={{ marginBottom: "8px" }}
                        />
                    </div>
                    )}
                  {!isMyMicActive && (
                    <Volume2 className="absolute top-2 right-2 text-red-500" size={42} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Loading />
          )}          
            {true && (<div className="cust-cam w-full md:w-1/2">
              <div className=" rounded-lg">
                <div className="relative flex justify-center items-center">
                  <video
                    playsInline
                    ref={partnerVideoRef}
                    onClick={(e) => {
                      toggleFullScreen(e);
                      forcePlayVideos();
                    }}
                    autoPlay
                    className="min-h-full min-w-full rounded-md"
                    style={{ opacity: isPartnerVideoActive ? 1 : 0 }}
                  />
                  {!isPartnerVideoActive && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 mx-auto bg-gray-300 w-24 h-24 rounded-full flex items-center justify-center border-2 border-gray-500">
                      <CameraOff
                          size={45}
                          style={{ marginBottom: "8px" }}
                        />
                    </div>
                    )}
                  {!isPartnerMicActive && (
                    <Volume2 className="absolute top-2 right-2 text-red-500" size={42} />
                  )}
                </div>
              </div>
            </div>          
      )}
        </div>
      </div>
      {userStream && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center justify-center space-x-3  bg-opacity-75 px-6 py-3 rounded-full">
          <button 
            onClick={toggleMicrophone} 
            className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white focus:outline-none transition duration-200"
          >
            {isMyMicActive ? <Mic size={25} /> : <MicOff size={25} />}
          </button>
          
          <button 
            onClick={handleVideoToggle} 
            className={`w-12 h-12 flex items-center justify-center ${!hasVideoPermission ? 'bg-gray-500 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'} rounded-full text-white focus:outline-none transition duration-200`}
            disabled={!hasVideoPermission}
          >
            {isMyVideoActive ? (
              <Camera size={25} />
            ) : (
              <CameraOff size={25} />
            )}
          </button>
          
          {isCallAccepted && !isCallEnded && (
            <button
              className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white focus:outline-none transition duration-200"
              onClick={toggleScreenSharingMode}
            >
              <Share size={23} />
            </button>
          )}
          
          {isCallAccepted && !isCallEnded && (
            <button 
              className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-full text-white focus:outline-none transition duration-200 relative"
              onClick={toggleModal}
            >
              <MessageCircle size={22} />
              {hasUnreadMessages && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />
              )}
            </button>
          )}
          
          {isCallAccepted && !isCallEnded && (
            <button 
              className="w-12 h-12 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full text-white focus:outline-none transition duration-200"
              onClick={endCall}
            >
              <PhoneOff size={22} />
            </button>
          )}
        </div>
      )}
      <ChatModal
        isVisible={isModalVisible}
        toggleModal={toggleModal}
        chatMessages={chatMessages}
        sendMessage={sendMessage}
        setSendMessage={setSendMessage}
        onSearch={onSearch}
        receivedMessage={receivedMessage}
      />
    </>
  );
};

export default Video;