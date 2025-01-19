import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does VidGenix generate videos from text?",
    answer: "VidGenix uses advanced AI models to convert your text into a script, generate images, create voiceovers, and assemble everything into a cohesive video. It leverages Groq LLaMa 3.3 70B for script generation, Flux for image creation, and Deepgram for AI voiceovers."
  },
  {
    question: "Can I customize the generated videos?",
    answer: "Yes, VidGenix offers various customization options. You can adjust the script, choose different image styles, select voice types for the voiceover, and make edits to the final video assembly."
  },
  {
    question: "What types of videos can I create with VidGenix?",
    answer: "VidGenix is versatile and can create a wide range of videos, including explainer videos, product demonstrations, educational content, marketing materials, and more. If you can describe it in text, VidGenix can help you turn it into a video."
  },
  {
    question: "How long does it take to generate a video?",
    answer: "The time to generate a video depends on its length and complexity. Typically, a short 1-2 minute video can be generated in about 10-15 minutes. Longer or more complex videos may take additional time."
  },
  {
    question: "Do I need any video editing skills to use VidGenix?",
    answer: "No, you don't need any video editing skills to use VidGenix. Our AI-powered platform handles the entire video creation process based on your text input. However, if you want to make further edits, we provide user-friendly tools for customization."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
              onClick={() => toggleQuestion(index)}
            >
              <span className="font-medium">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-blue-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-blue-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 text-gray-400">
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

