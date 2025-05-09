
"use client";
import Image from "next/image";
import Video from "./components/Video/Video";
import FormCard from "./components/FormCard/FormCard";
import IncomingCall from "./components/IncomingCall/IncomingCall";
import { useEffect } from "react";

export default function Home() {
  
  return (
    <section className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">       
      <Video />
      <FormCard />
      <IncomingCall />
    </section>
  );
}
