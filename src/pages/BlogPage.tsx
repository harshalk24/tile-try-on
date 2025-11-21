import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const BlogPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/pages/blog.md"
        title="Blog"
        description="Read insights, tips, and updates about interior design, material selection, and visualization technology from Nazaraa."
      />
      <Footer />
    </>
  );
};

export default BlogPage;

