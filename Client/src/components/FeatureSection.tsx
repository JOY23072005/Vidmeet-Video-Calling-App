import { Airplay, Gauge, MessageCircleMore, MonitorSmartphone, ShieldCheck, Video } from "lucide-react";

export default function FeatureSection(){
    
    return(
    <section  id="feature" className="section ">
        <h2 className="text-2xl font-bold text-center py-10">Features</h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-12">
            <div className="card">
                <Video className="w-15 h-15 mx-auto"/>
                <h3 className="text-subheading pt-2 pb-4 text-center">Crystal-Clear Video & Audio</h3>
                <p className="text-muted">
                    Enjoy ultra-smooth video calls with crisp audio and minimal latency.
                    Whether it's a team meeting or a casual catch-up, your conversations stay sharp and uninterrupted.
                </p>
            </div>
            <div className="card">
                <Gauge className="w-15 h-15 mx-auto"/>
                <h3 className="text-subheading pt-2 pb-4 text-center">Instant Meetings, No Signup Needed</h3>
                <p className="text-muted">
                    Jump into meetings with just a link — no signups, no downloads, no waiting. 
                    VidMeet makes connecting fast, frictionless, and incredibly simple.
                </p>
            </div>
            <div className="card">
                <Airplay className="w-15 h-15 mx-auto"/>
                <h3 className="text-subheading pt-2 pb-4 text-center">Effortless Screen Sharing</h3>
                <p className="text-muted">
                    Share your screen or a specific window with one click. 
                    Perfect for presentations, demos, or collaborative browsing, all in real time.
                </p>
            </div>
            <div className="card">
                <MessageCircleMore className="w-15 h-15 mx-auto" />
                <h3 className="text-subheading pt-2 pb-4 text-center">Built-in In-Call Messaging</h3>
                <p className="text-muted">
                    Send quick messages, links, or updates right inside your call. 
                    Our smooth in-call chat keeps everyone in sync without switching tabs.
                </p>
            </div>
            <div className="card">
                <ShieldCheck className="w-15 h-15 mx-auto" />
                <h3 className="text-subheading pt-2 pb-4 text-center">Secure & Private by Design</h3>
                <p className="text-muted">
                    VidMeet uses end-to-end encryption to keep your conversations safe. 
                    Your meetings stay yours — private, secure, and protected from prying eyes.
                </p>
            </div>
            <div className="card">
                <MonitorSmartphone className="w-15 h-15 mx-auto" />
                <h3 className="text-subheading pt-2 pb-4 text-center">Cross-Device Compatibility</h3>
                <p className="text-muted">
                    Join meetings from any device — desktop, tablet, or phone. 
                    VidMeet is fully responsive, so you can stay connected wherever you are.
                </p>
            </div>
        </div>
    </section>
    )
}