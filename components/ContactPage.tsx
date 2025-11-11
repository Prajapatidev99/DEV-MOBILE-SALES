import * as React from 'react';

const ContactPage: React.FC = () => {
  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">Contact Us</h1>
      <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
        Have a question or need support? Fill out the form below or visit us in-store. We're here to help!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-lg shadow-md border border-gray-200">
        <div>
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input type="text" id="name" required className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Your Email</label>
              <input type="email" id="email" required className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea id="message" rows={5} required className="w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300">
              Send Message
            </button>
          </form>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-6">Find Us Here</h2>
          <div className="h-80 rounded-lg overflow-hidden border border-gray-200">
            <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.558362624536!2d72.51865937510166!3d23.03990491563141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b3535238283%3A0x3f338520281b365!2sDev%20Mobile%20Service!5e0!3m2!1sen!2sin!4v1719253457193!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Dev Mobile Location"
            ></iframe>
          </div>
          <div className="mt-6 text-gray-700 space-y-2">
            <p><span className="font-bold text-gray-800">Address:</span><br/>Shreeji enclave complex, L-15, Ramdevnagar Rd, opposite Saajan Apartment, satellite, Ahmedabad, Gujarat 380015</p>
            <p><span className="font-bold text-gray-800">Phone:</span><br/>99741 55881<br/>9974221322</p>
            <p><span className="font-bold text-gray-800">Email:</span> <a href="mailto:devmobile9974@gmail.com" className="text-blue-600 hover:underline">devmobile9974@gmail.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;