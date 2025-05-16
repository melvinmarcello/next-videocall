
"use client";
import Video from "../components/Video/Video";
import IncomingCall from "../components/IncomingCall/IncomingCall";
import { useContext, useEffect } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import axios from "axios";

export default function page() {
  const { myUserId } = useContext(VideoCallContext);    
  console.log("myUserId", myUserId);
  
    const fetchPeerId = async (peerId) => {
      try {
        const response = await axios.post("/api/client", { peerId }, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status !== 200) {
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
