import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const AboutPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/pages/about.md"
        title="About Us"
        description="Learn about Nazaraa's mission to revolutionize material visualization for interior design professionals and retailers."
      />
      <Footer />
    </>
  );
};

export default AboutPage;

