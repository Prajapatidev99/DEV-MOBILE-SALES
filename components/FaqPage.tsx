import * as React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const faqData = [
    {
        question: "Which is the best mobile shop in Ahmedabad?",
        answer: "Dev Mobile is a top-rated choice, trusted by thousands of customers for over five years. We are known for our honest deals, expert guidance, reliable after-sales service, and fast support. When you buy from us, you buy peace of mind."
    },
    {
        question: "Who offers same-day delivery in Ahmedabad for phones?",
        answer: "We do! If your pincode is in our local delivery range (e.g., Satellite, Prahladnagar, SG Highway), Dev Mobile offers same-day delivery right from our local store, brought safely to your doorstep by our own team."
    },
    {
        question: "Is it safe to pay via UPI for a mobile purchase?",
        answer: "Absolutely. Our website uses a secure custom payment system. You can safely pay via any UPI app, and then you simply provide the UTR/Transaction ID for our team to verify. This manual verification step ensures your payment is confirmed securely before your order is processed."
    },
    {
        question: "Where can I buy a phone online near me?",
        answer: "You can buy directly from our website! We serve all of Ahmedabad and beyond. For local customers, we offer same-day delivery or in-store pickup. For customers outside Ahmedabad, we ship your order safely through trusted courier partners like Delhivery or Shiprocket."
    },
   
    {
        question: "How long does shipping take?",
        answer: "For areas outside Ahmedabad, standard courier shipping typically takes 1-3 business days. You'll receive a tracking number as soon as your order has shipped."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept payments via any UPI app (like GPay, PhonePe, Paytm, etc.). During checkout, you will be shown a QR code and UPI ID to complete the payment."
    },
    {
        question: "Is there a warranty on your products?",
        answer: "Yes, all new devices come with a one-year manufacturer's warranty that covers defects in materials and workmanship."
    }
];

const FaqItem: React.FC<{ faq: typeof faqData[0]; isOpen: boolean; onClick: () => void; }> = ({ faq, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onClick}
                className="w-full text-left flex justify-between items-center py-4 px-6 focus:outline-none"
            >
                <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
            >
                <p className="p-6 pt-0 text-gray-700">{faq.answer}</p>
            </div>
        </div>
    );
};


const FaqPage: React.FC = () => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
            <AnimateOnScroll>
              <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  {faqData.map((faq, index) => (
                      <FaqItem
                          key={index}
                          faq={faq}
                          isOpen={openIndex === index}
                          onClick={() => handleToggle(index)}
                      />
                  ))}
              </div>
            </AnimateOnScroll>
        </div>
    );
};

export default FaqPage;