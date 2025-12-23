"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does QuotaPilot Ai analyze calls?",
    answer:
      "QuotaPilot Ai uses advanced AI to analyze call transcripts. You can upload transcripts manually or paste them directly. Our AI then generates summaries, scores performance across key dimensions, and detects objections automatically.",
  },
  {
    question: "What integrations do you support?",
    answer:
      "Currently, QuotaPilot Ai works with manual transcript uploads. We're working on integrations with popular call recording platforms like Zoom, Gong, and Chorus. Enterprise customers can request custom integrations.",
  },
  {
    question: "How accurate is the AI scoring?",
    answer:
      "Our AI scoring in QuotaPilot Ai is based on industry best practices and trained patterns from successful sales calls. While it provides consistent, objective scoring, we recommend using it as a coaching tool alongside manager judgment.",
  },
  {
    question: "Can I try it before committing?",
    answer:
      "Yes! All plans include a 14-day free trial. No credit card required. You can upload calls, see AI analysis, and explore all features during your trial.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption, secure data storage, and follow SOC 2 compliance standards. Your call data is never shared with third parties and is only used to provide insights to your team.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer:
      "If you exceed your monthly call limit, we'll notify you and you can upgrade your plan or wait until the next billing cycle. We never delete your data or cut off access without warning.",
  },
];

export const FAQ = () => {
  return (
    <section id="faq" className="py-24 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to know about QuotaPilot Ai
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem value={`item-${index}`} className="border-b">
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

