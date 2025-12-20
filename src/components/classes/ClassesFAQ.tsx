import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "Who is this for?",
    answer: "This program is designed for F-Commerce sellers, online business owners, influencers, and makeup artists in Bangladesh who want to build a stable, organized, and profitable business. Whether you're just starting or have been selling for a while, this program will help you level up."
  },
  {
    question: "Is this online or offline?",
    answer: "All sessions are conducted online via Zoom or Google Meet. You can join from anywhere in Bangladesh (or the world!) with a stable internet connection. Recordings are also provided for review."
  },
  {
    question: "How long is the support?",
    answer: "Both programs include long-term support. You'll be added to an exclusive community group where you can ask questions, get feedback, and network with fellow entrepreneurs. The support continues well beyond the training days."
  },
  {
    question: "How do I pay via bKash?",
    answer: "Send your payment to bKash number 01328845972. After payment, submit your enrollment interest through the form and include your bKash transaction ID when we contact you on WhatsApp."
  },
  {
    question: "What happens after I submit my WhatsApp number?",
    answer: "Our team will contact you on WhatsApp within 24 hours to discuss the program, answer your questions, and guide you through the enrollment process. We'll also share payment confirmation and session details."
  }
];

export const ClassesFAQ = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30 mb-6">
            <HelpCircle className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">FAQ</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-cream mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-cream/60">
            Everything you need to know about our programs
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqItems.map((item, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="bg-card/50 backdrop-blur-sm border border-gold/20 rounded-2xl px-6 data-[state=open]:border-gold/40 transition-all duration-300"
            >
              <AccordionTrigger className="text-left font-serif text-lg text-cream hover:text-gold py-5 hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-cream/70 pb-5 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
