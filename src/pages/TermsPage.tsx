import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const TermsPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/policies/terms.md"
        title="Terms of Service"
        description="Read Nazaraa's Terms of Service to understand the rules and regulations for using our tile visualization platform."
      />
      <Footer />
    </>
  );
};

export default TermsPage;

