import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/pages/contact.md"
        title="Contact Us"
        description="Get in touch with the Nazaraa team for questions, support, partnerships, or general inquiries."
      />
      <Footer />
    </>
  );
};

export default ContactPage;

