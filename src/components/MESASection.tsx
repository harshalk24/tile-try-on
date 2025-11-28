const MESASection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#F6F7F8] relative">
      {/* MESA Logo in corner */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-10">
        <img 
          src="/homepage_images/mesa logo.png" 
          alt="MESA School of Business Logo"
          className="h-8 sm:h-12 md:h-16 w-auto opacity-90"
        />
      </div>

      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          {/* Image Section */}
          <div className="order-2 md:order-1">
            <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
              <img 
                src="/homepage_images/Mesa-School-funding-feature-760x570.png" 
                alt="MESA School of Business"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#222] mb-4 sm:mb-6">
              Backed by MESA School of Business
            </h2>
            <p className="text-base sm:text-lg text-[#222]/70 mb-4 sm:mb-6 leading-relaxed">
              We are proudly incubated by MESA School of Business, India's leading entrepreneurial program. With hands-on mentorship from industry experts, we've refined our product, strategy, and go-to-market execution to better serve our customers.
            </p>
            <p className="text-base sm:text-lg text-[#222]/70 mb-4 sm:mb-6 leading-relaxed">
              MESA's guidance across product development, branding, growth, and sales helps us deliver innovative solutions that transform how homeowners, designers, and retailers visualize and select materials.
            </p>
            {/* Co-founders Description */}
            <p className="text-sm sm:text-base text-[#222]/80 italic leading-relaxed border-l-4 border-[#FF6B35] pl-3 sm:pl-4">
              Founded by Varun Limaye and Ankit Agarwal, MESA School of Business is India's leading entrepreneurial program dedicated to nurturing innovative startups and empowering the next generation of business leaders.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MESASection;

