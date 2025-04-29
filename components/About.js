function About() {
  const paragraphStyle1 = {
    marginBottom: "15px", // Adjust as needed
  };

  const paragraphStyle2 = {
    marginBottom: "15px", // Adjust as needed
  };

  return (
    <section
      id="about"
      className="bg-yellow-50 flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-2 px-10 py-8 lg:py-20"
    >
      <div className="flex flex-col gap-12 lg:gap-12 items-center justify-center text-center lg:text-left lg:items-start">
        <h2 className="text-3xl font-bold">About Us</h2>
        <p className="text-base" style={paragraphStyle1}>
          Discover the Joy of Hassle-Free Travel Planning with Hopwell
        </p>
        <p className="text-base">
          Welcome to Hopwell, the AI-powered travel companion revolutionizing
          the way adventurers and leisure seekers craft their perfect getaway.
          Our innovative platform is designed to transform your travel
          aspirations into a meticulously tailored experience that resonates
          with your personal preferences.
        </p>
        <p className="text-base" style={paragraphStyle2}>
          Gone are the days of travel anxiety and the overwhelming task of
          sifting through endless options. Our user-friendly interface offers a
          seamless process that presents you with choices that feel custom-made,
          because they are. Whether you're a thrill-seeker longing for
          adventure, a culture enthusiast eager to soak in new experiences, or a
          tranquility chaser looking to unwind, we've got you covered.
        </p>
        <p className="text-2xl font-bold">
          Welcome to the future of travel with Hopwell.
        </p>
      </div>
    </section>
  );
}

export default About;
