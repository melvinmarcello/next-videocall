"use client";
import React, { useState, useEffect, useRef, createContext } from "react";
import { socket } from "../config/config";
import Peer from "simple-peer";

const VideoCallContext = createContext();

const VideoCallProvider = ({ children }) => {
  const [userStream, setUserStream] = useState(null);
  const [call, setCall] = useState({});
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isCallEnded, setIsCallEnded] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const [partnerUserId, setPartnerUserId] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [receivedMessage, setReceivedMessage] = useState("");
  const [name, setName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [isMyVideoActive, setIsMyVideoActive] = useState(true);
  const [isPartnerVideoActive, setIsPartnerVideoActive] = useState(true);
  const [isMyMicActive, setIsMyMicActive] = useState(true);
  const [isPartnerMicActive, setIsPartnerMicActive] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasVideoPermission, setHasVideoPermission] = useState(true);

  const myVideoRef = useRef();
  const partnerVideoRef = useRef();
  const peerConnectionRef = useRef();
  const screenShareTrackRef = useRef();

  // Effect to initialize user media stream
  useEffect(() => {
    const getUserMediaStream = async () => {
      try {        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
                
        setUserStream(stream);
        setHasVideoPermission(true);
        
        // Ensure the video track is enabled
        stream.getVideoTracks().forEach(track => {
          track.enabled = isMyVideoActive;
        });
        
        // Ensure the audio track is enabled
        stream.getAudioTracks().forEach(track => {
          track.enabled = isMyMicActive;
        });
      } catch (error) {
        console.error("Error accessing media devices:", error);
        setHasVideoPermission(false);
        
        // Try to get audio only if video fails
        try {
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          setUserStream(audioOnlyStream);
          setIsMyVideoActive(false);
        } catch (audioError) {
          console.error("Failed to get audio as fallback:", audioError);
        }
      }
    };

    getUserMediaStream();
  }, []);

  // Separate effect to handle video element when stream changes
  useEffect(() => {
    if (userStream && myVideoRef.current) {      
      myVideoRef.current.srcObject = userStream;
      
      // Force play the video (addresses autoplay issues in some browsers)
      const playPromise = myVideoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Local video playing successfully");
          })
          .catch(error => {
            console.error("Error playing local video:", error);
          });
      }
    }
  }, [userStream]);

  useEffect(() => {
    const handleSocketEvents = () => {
      socket.on("connect", () => {
        console.log("Connected with ID:", socket.id); // You should see this first
      });


      socket.on("socketId", (id) => {
        console.log("Socket ID received:", id);   
        setMyUserId(id);
      });

      socket.on("mediaStatusChanged", ({ mediaType, isActive }) => {
        console.log("Media status changed:", mediaType, isActive);
        if (isActive !== null) {
          if (mediaType === "video") {
            setIsPartnerVideoActive(isActive);
          } else if (mediaType === "audio") {
            setIsPartnerMicActive(isActive);
          } else if (mediaType === "both" && Array.isArray(isActive)) {
            setIsPartnerMicActive(isActive[0]);
            setIsPartnerVideoActive(isActive[1]);
          }
        }
      });

      socket.on("callTerminated", () => {
        setIsCallEnded(true);
        window.location.reload();
      });

      socket.on("incomingCall", ({ from, name, signal }) => {
        setCall({ isReceivingCall: true, from, name, signal });
      });

      socket.on("receiveMessage", ({ message: text, senderName }) => {
        const receivedMsg = { text, senderName };
        setReceivedMessage(receivedMsg);

        const timeout = setTimeout(() => {
          setReceivedMessage({});
        }, 1000);

        return () => clearTimeout(timeout);
      });
    };

    handleSocketEvents();

    return () => {
      // Clean up event listeners
      socket.off("socketId");
      socket.off("mediaStatusChanged");
      socket.off("callTerminated");
      socket.off("incomingCall");
      socket.off("receiveMessage");
    };
  }, []);

  const receiveCall = () => {
    if (!userStream) {
      console.error("Cannot receive call: user stream is not available");
      return;
    }
    
    setIsCallAccepted(true);
    setPartnerUserId(call.from);
    const peer = new Peer({      
      initiator: false,
      trickle: false,
      stream: userStream,
    });    

    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: call.from,
        userName: name,
        mediaType: "both",
        mediaStatus: [isMyMicActive, isMyVideoActive],
      });
    });

    peer.on("stream", (currentStream) => {
      console.log("Received partner stream", currentStream);
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = currentStream;
        
        // Force play the video 
        const playPromise = partnerVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing partner video:", error);
          });
        }
      }
    });
    
    peer.signal(call.signal);
    peerConnectionRef.current = peer;
  };

  const callUser = (targetId) => {
    if (!userStream) {
      console.error("Cannot make call: user stream is not available");
      return;
    }
    
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: userStream,
    });
    setPartnerUserId(targetId);

    peer.on("signal", (data) => {
      socket.emit("initiateCall", {
        targetId,
        signalData: data,
        senderId: myUserId,
        senderName: name,
      });
    });

    peer.on("stream", (currentStream) => {
      console.log("Received partner stream in callUser", currentStream);
      if (partnerVideoRef.current) {
        partnerVideoRef.current.srcObject = currentStream;
        
        // Force play the video 
        const playPromise = partnerVideoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Error playing partner video:", error);
          });
        }
      }
    });

    socket.on("callAnswered", ({ signal, userName, mediaStatus }) => {
      setIsCallAccepted(true);
      setOpponentName(userName);
      
      // If mediaStatus is provided, set partner's media status
      if (mediaStatus && Array.isArray(mediaStatus)) {
        setIsPartnerMicActive(mediaStatus[0]);
        setIsPartnerVideoActive(mediaStatus[1]);
      }
      
      peer.signal(signal);
      
      // Send own media status
      socket.emit("changeMediaStatus", {
        mediaType: "both",
        isActive: [isMyMicActive, isMyVideoActive],
      });
    });

    peerConnectionRef.current = peer;
  };

  const toggleVideo = () => {
    if (!userStream) return false;
    
    const newStatus = !isMyVideoActive;
    setIsMyVideoActive(newStatus);

    userStream.getVideoTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "video",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleMicrophone = () => {
    if (!userStream) return false;
    
    const newStatus = !isMyMicActive;
    setIsMyMicActive(newStatus);

    userStream.getAudioTracks().forEach((track) => {
      track.enabled = newStatus;
    });

    socket.emit("changeMediaStatus", {
      mediaType: "audio",
      isActive: newStatus,
    });

    return newStatus;
  };

  const toggleScreenSharingMode = () => {
    if (!userStream) return;
    
    if (!isMyVideoActive) {
      alert("Please turn on your video to share the screen");
      return;
    }
    
    if (!isScreenSharing) {
      navigator.mediaDevices
        .getDisplayMedia({ cursor: true })
        .then((screenStream) => {
          const screenTrack = screenStream.getTracks()[0];
          
          if (peerConnectionRef.current && peerConnectionRef.current.streams && peerConnectionRef.current.streams[0]) {
            const videoTracks = peerConnectionRef.current.streams[0].getTracks();
            const videoTrack = videoTracks.find(
              (track) => track.kind === "video"
            );
            
            if (videoTrack) {
              peerConnectionRef.current.replaceTrack(
                videoTrack,
                screenTrack,
                userStream
              );
              
              screenTrack.onended = () => {
                peerConnectionRef.current.replaceTrack(
                  screenTrack,
                  videoTrack,
                  userStream
                );
                
                if (myVideoRef.current) {
                  myVideoRef.current.srcObject = userStream;
                }
                setIsScreenSharing(false);
              };
              
              if (myVideoRef.current) {
                myVideoRef.current.srcObject = screenStream;
              }
              screenShareTrackRef.current = screenTrack;
              setIsScreenSharing(true);
            }
          }
        })
        .catch((error) => {
          console.log("Failed to get screen sharing stream", error);
        });
    } else if (screenShareTrackRef.current) {
      screenShareTrackRef.current.stop();
      if (typeof screenShareTrackRef.current.onended === 'function') {
        screenShareTrackRef.current.onended();
      }
    }
  };

  const toggleFullScreen = (e) => {
    const element = e.target;

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch((err) => {
        console.error(`Error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const endCall = () => {
    setIsCallEnded(true);
    socket.emit("terminateCall", { targetId: partnerUserId });
    if (peerConnectionRef.current) {
      peerConnectionRef.current.destroy();
    }
    window.location.reload();
  };

  const endIncomingCall = () => {
    socket.emit("terminateCall", { targetId: partnerUserId });
  };

  const sendMessage = (text) => {
    const newMessage = {
      message: text,
      type: "sent",
      timestamp: Date.now(),
      sender: name,
    };

    setChatMessages((prevMessages) => [...prevMessages, newMessage]);

    socket.emit("sendMessage", {
      targetId: partnerUserId,
      message: text,
      senderName: name,
    });
  };

  return (
    <VideoCallContext.Provider
      value={{
        call,
        isCallAccepted,
        myVideoRef,
        partnerVideoRef,
        userStream,
        name,
        setName,
        isCallEnded,
        myUserId,
        callUser,
        endCall,
        receiveCall,
        sendMessage,
        receivedMessage,
        chatMessages,
        setChatMessages,
        setReceivedMessage,
        setPartnerUserId,
        endIncomingCall,
        opponentName,
        isMyVideoActive,
        setIsMyVideoActive,
        isPartnerVideoActive,
        setIsPartnerVideoActive,
        toggleVideo,
        isMyMicActive,
        isPartnerMicActive,
        toggleMicrophone,
        isScreenSharing,
        toggleScreenSharingMode,
        toggleFullScreen,
        hasVideoPermission,
      }}
    >
      {children}
    </VideoCallContext.Provider>
  );
};

export { VideoCallContext, VideoCallProvider };