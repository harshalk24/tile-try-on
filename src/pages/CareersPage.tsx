import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const CareersPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/pages/careers.md"
        title="Careers"
        description="Join the Nazaraa team and help revolutionize the interior design and material visualization industry."
      />
      <Footer />
    </>
  );
};

export default CareersPage;

