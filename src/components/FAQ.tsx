import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "How accurate are the visualizations?",
      answer: "Our AI-powered visualizations use advanced photorealistic rendering technology to provide highly accurate representations of how materials will look in your space. We maintain a 90%+ accuracy rate based on customer feedback."
    },
    {
        question: "Is there a cost to use the visualizer?",
        answer: "Yes, the visualizer is a paid feature. Pricing varies based on the plan or package you choose. You only pay for the visualizer access and any additional services such as sample orders or design consultations."
      },
    {
      question: "Do you support commercial/B2B projects?",
      answer: "Absolutely! We offer specialized B2B features including bulk uploads, branded visualizer experiences, analytics dashboards, and dedicated account management for retailers and design firms."
    },
    {
      question: "What file formats do you accept for room photos?",
      answer: "We accept JPG, PNG, and WebP formats. Images should be at least 1024x768 pixels for best results. Maximum file size is 10MB."
    },
    {
      question: "How long does it take to generate a visualization?",
      answer: "Most visualizations are generated within 30-60 seconds. Complex rooms with multiple materials may take up to 2 minutes."
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-[#222] mb-12">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#E6E6E6]">
              <AccordionTrigger className="text-left text-lg font-semibold text-[#222] hover:text-[#FF6B35]">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-[#222]/70 pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;

