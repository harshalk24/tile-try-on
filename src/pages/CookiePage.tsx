import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CookiePreferences from "@/components/CookiePreferences";

const CookiePage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/policies/cookie.md"
        title="Cookie Policy"
        description="Understand how Nazaraa uses cookies and similar technologies to enhance your experience on our platform."
      />
      {/* Cookie Preferences Component - Embedded in page */}
      <div className="bg-white">
        <div className="container mx-auto max-w-3xl py-8 px-6">
          <CookiePreferences embedded={true} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CookiePage;

