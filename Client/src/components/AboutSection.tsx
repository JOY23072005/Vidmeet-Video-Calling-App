export default function AboutSection() {
  return (
    <section id="about" className="section px-6 py-16 lg:py-24 bg-[rgb(var(--color-secondary))] text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6">
          About
        </h2>
        <p className="text-muted mb-4 leading-relaxed">
          <span className="font-semibold ">VidMeet</span> is your go-to platform for effortless, real-time video communication.
          Whether you're catching up with friends, hosting a team meeting, or teaching a class, VidMeet delivers smooth video,
          crystal-clear audio, and powerful collaboration features — all in one place.
        </p>
        <p className="text-muted mb-4 leading-relaxed">
          We believe in keeping communication <span className=" font-medium">simple, fast, and accessible to everyone.</span>
          That’s why <span className="text-green-400 font-semibold">VidMeet is 100% free to use</span> — no signups, no subscriptions,
          and no hidden fees.
        </p>
        <p className="text-muted leading-relaxed">
          With a sleek dark theme, responsive design, and features like screen sharing, built-in chat, and secure rooms,
          VidMeet is built to bring people together — anytime, anywhere.
        </p>

        <div className="inline-block mt-6">
          <span className="bg-green-500/20 text-green-300 text-sm px-4 py-2 rounded-full font-semibold shadow-md backdrop-blur">
            ✅ Always Free. No Strings Attached.
          </span>
        </div>
      </div>
    </section>
  );
}
