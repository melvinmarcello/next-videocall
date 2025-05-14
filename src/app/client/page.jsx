
"use client";
import Video from "../components/Video/Video";
import IncomingCall from "../components/IncomingCall/IncomingCall";
import { useContext, useEffect } from "react";
import { VideoCallContext } from "../context/VideoCallContext";

export default function page() {
  const { name, setName, myUserId, callUser, isCallAccepted } = useContext(VideoCallContext);
  console.log("myUserId", myUserId);
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

  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">       
      <Video />      
      <IncomingCall />
    </section>
  );
}
