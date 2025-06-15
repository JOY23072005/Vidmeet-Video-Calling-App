import { Ban } from "lucide-react";
import { useMedia } from "../context/MediaContext";
import { useEffect } from "react";

export default function NotFound(){
      const {cleanup} = useMedia();
    
      useEffect(()=>{
        return ()=>{
          cleanup();
        }
      },[cleanup])
    return(
        <section className="section">
            <div className="card flex flex-row justify-center align-center">
                <Ban className="w-[10vw] h-100"/>
                <h1 className="text-[10vw] text-heading my-auto"> Not Found! </h1>
            </div>
        </section>
    )
}