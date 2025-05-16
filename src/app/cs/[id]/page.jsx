
"use client";
import Video from "@/app/components/Video/Video";
import FormCard from "@/app/components/FormCard/FormCard";
import IncomingCall from "@/app/components/IncomingCall/IncomingCall";


export default function Home() {
  
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">       
      <Video />
      <FormCard />      
    </section>
  );
}
