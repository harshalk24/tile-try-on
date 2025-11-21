const MESASection = () => {
  const mentors = [
    {
      name: "Varun Limaye",
      role: "Co-founder, MESA School of Business. Product, GTM & Founder-Mentality Mentor.",
      photo: "/mentors/varun-limaye.jpg" // Placeholder - you can add actual photos later
    },
    {
      name: "Ankit Agarwal",
      role: "Cofounder, Do Your Thng. Branding, Growth & Consumer Behaviour Mentor.",
      photo: "/mentors/ankit-agarwal.jpg" // Placeholder - you can add actual photos later
    },
    {
      name: "Siddharth Chauhan",
      role: "Ex-VP, Byju's. Sales, Ops & Category Strategy Mentor.",
      photo: "/mentors/siddharth-chauhan.jpg" // Placeholder - you can add actual photos later
    }
  ];

  return (
    <section className="py-[80px] px-6 bg-[#F6F7F8]">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-4xl font-bold text-center text-[#222] mb-4">
          Backed by MESA School of Business
        </h2>
        <p className="text-center text-[#222]/70 mb-12 max-w-3xl mx-auto text-lg">
          We are proudly supported by India's leading entrepreneurial program, with hands-on mentorship that shapes our product, strategy, and go-to-market execution.
        </p>

        {/* Mentor Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {mentors.map((mentor, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-[0_4px_16px_rgba(0,0,0,0.06)] text-center"
            >
              {/* Circular Photo Placeholder */}
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-[#E6E6E6] flex items-center justify-center overflow-hidden">
                {mentor.photo ? (
                  <img
                    src={mentor.photo}
                    alt={mentor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/10 flex items-center justify-center">
                    <span className="text-[#FF6B35] text-2xl font-bold">
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
              </div>

              {/* Mentor Name */}
              <h3 className="text-xl font-bold text-[#222] mb-3">
                {mentor.name}
              </h3>

              {/* Role Description */}
              <p className="text-sm text-[#222]/70 leading-relaxed">
                {mentor.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MESASection;

