import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import FeatureSection from "../components/FeatureSection";
import AboutSection from "../components/AboutSection";
import { useMedia } from "../context/MediaContext";
import { useEffect } from "react";

export default function Home() {
  const {cleanup} = useMedia();

  useEffect(()=>{
    return ()=>{
      cleanup();
    }
  },[cleanup])
  return (
    <>
    <Navbar/>
    <main>
    <HeroSection/>
    <FeatureSection/>
    <AboutSection/>
    </main>
    </>
  )
}
