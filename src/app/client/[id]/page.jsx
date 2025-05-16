
"use client";
import IncomingCall from "@/app/components/IncomingCall/IncomingCall";
import { useContext, useEffect } from "react";
import { VideoCallContext } from "@/app/context/VideoCallContext";
import axios from "axios";
import VideoClient from "@/app/components/VideoClient";
import { usePathname } from "next/navigation";

export default function page() {
  const { myUserId } = useContext(VideoCallContext);    
  const pathname = usePathname();  
  
    const fetchPeerId = async (peerId) => {
      try {
        const response = await axios.post("/api/client", { peerId, uniq_id: pathname.split("/")[2] });

        if (response.status !== 200) {
          throw new Error("Network response was not ok");
        }          
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
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">       
      <VideoClient />      
      <IncomingCall />
    </section>
  );
}
