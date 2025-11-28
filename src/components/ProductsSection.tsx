const ProductsSection = () => {
  const graphics = [
    {
      id: 1,
      image: "/homepage_images/product-graphic1.jpeg",
      title: "Easy Upload & Selection",
      description: "Upload your room photo and explore our extensive library of design options"
    },
    {
      id: 2,
      image: "/homepage_images/product-graphic2.jpeg",
      title: "Design Customization",
      description: "Choose from tiles, paint, wallpaper, panels, and wall decor to customize your space"
    },
    {
      id: 3,
      image: "/homepage_images/product-graphic3.jpeg",
      title: "Real-time Visualization",
      description: "See your design come to life with photorealistic visualizations and compare with original"
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-16 bg-[#FFE5D4]">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[#222] mb-3 sm:mb-4">
            How It Works
          </h2>
          <p className="text-base sm:text-lg text-[#222]/70 max-w-3xl mx-auto px-4">
            Transform your space in three simple steps with our intuitive design platform
          </p>
        </div>

        {/* Graphics Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12">
          {graphics.map((graphic, index) => (
            <div 
              key={graphic.id}
              className="flex flex-col items-center text-center"
            >
              {/* Image Container */}
              <div className="w-full mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white">
                <img 
                  src={graphic.image} 
                  alt={graphic.title}
                  className="w-full h-auto object-contain"
                />
              </div>
              
              {/* Content */}
              <div className="max-w-sm px-2">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FF6B35]/20 mb-3 sm:mb-4">
                  <span className="text-xl sm:text-2xl font-bold text-[#FF6B35]">
                    {index + 1}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-[#222] mb-2 sm:mb-3">
                  {graphic.title}
                </h3>
                <p className="text-sm sm:text-base text-[#222]/70 leading-relaxed">
                  {graphic.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Text */}
        <div className="text-center px-4">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[#222] font-medium max-w-4xl mx-auto leading-relaxed">
            Proven to increase retailer conversion rates by <span className="font-bold text-[#FF6B35]">40%</span> and reduce customer tile-selection time by <span className="font-bold text-[#FF6B35]">50%</span>— get started in under 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

