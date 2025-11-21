import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const PrivacyPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/policies/privacy.md"
        title="Privacy Policy"
        description="Learn how Nazaraa collects, uses, and protects your personal information in our Privacy Policy."
      />
      <Footer />
    </>
  );
};

export default PrivacyPage;

