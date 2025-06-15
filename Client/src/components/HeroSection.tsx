import images from "/assets/Images.svg"

export default function HeroSection() {
  return (
    <section id="hero" className="section grid md:grid-cols-2 pe-0 pt-0 md:space-x-12">
      {/* Text hero */}
      <div className="flex flex-col justify-center max-md:my-20">
        <h1 className="text-heading">VidMeet</h1>
        <p className="text-subheading">
          Welcome to VidMeet — a sleek, modern video conferencing platform built for fast, secure, and high-quality meetings.
          Enjoy smooth HD video and audio, real-time screen sharing, and a beautiful dark mode interface with glowing controls. 
          No logins, no hassle — just share a link and start collaborating from any device.
        </p>
      </div>
      {/* Image hero */}
      <img className="w-full opacity-0 translate-x-5 transition-all duration-700 ease-in-out" src={images}
      onLoad={(e) => {
        e.currentTarget.classList.remove("opacity-0", "translate-x-5");
      }}
      />
    </section>
  )
}
