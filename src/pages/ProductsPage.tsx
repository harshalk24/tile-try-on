import PolicyPage from "@/components/PolicyPage";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ProductsPage = () => {
  return (
    <>
      <Navigation />
      <PolicyPage
        markdownPath="/content/pages/products.md"
        title="Products"
        description="Explore Nazaraa's comprehensive suite of visualization and material selection tools for interior design projects."
      />
      <Footer />
    </>
  );
};

export default ProductsPage;

