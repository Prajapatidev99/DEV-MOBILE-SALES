import * as React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const SecurityGuide: React.FC = () => {
    return (
        <AnimateOnScroll className="max-w-4xl mx-auto">
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md border border-gray-200 text-gray-700 leading-relaxed">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 text-center">Ultimate Security: QR Code Provisioning Guide</h1>
                <p className="text-center text-gray-600 mb-8">
                    This is the new, recommended method for securing devices. It's faster, easier, and closes security loopholes found in manual setup methods, such as on-device FRP bypasses.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg mb-8">
                    <p className="font-bold text-yellow-800">Requirement:</p>
                    <p className="text-yellow-700">This process can only be performed on a brand new or factory-reset phone. It will not work if the phone has already been set up.</p>
                </div>

                <div className="space-y-12">
                    
                    {/* Step 1 */}
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Prepare the Phone</h2>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Turn on the new (or freshly factory-reset) phone.</li>
                                <li>Stay on the very first "Welcome" screen (where you select a language). <strong className="font-semibold">Do not proceed.</strong></li>
                                <li>Tap on the same spot on the "Welcome" screen 7 times. This will activate a hidden QR code scanner.</li>
                            </ol>
                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm">
                                <p><strong className="font-semibold text-gray-800">Wi-Fi:</strong> The phone will prompt you to connect to a Wi-Fi network before it can download the app. For a truly zero-touch setup, Wi-Fi credentials can be embedded into the QR code by a developer.</p>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Scan from Dashboard</h2>
                            <ol className="list-decimal list-inside space-y-2">
                                <li>Log in to your EMI Secure Dashboard.</li>
                                <li>Go to the Customers page and click on the customer who owns the device.</li>
                                <li>In the Registered Devices list, find the correct device and click the "QR Code" button.</li>
                                <li>A modal with a unique QR code will appear.</li>
                                <li>Use the phone's QR scanner (activated in Step 1) to scan the code from your computer screen.</li>
                            </ol>
                        </div>
                    </div>
                    
                    {/* Step 3 */}
                     <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0 bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Automated Setup</h2>
                            <p>The phone will now do everything automatically:</p>
                            <ul className="list-disc list-inside space-y-2 mt-2">
                                <li>Connect to the internet.</li>
                                <li>Download the security app.</li>
                                <li>Install the app and set it as the unremovable Device Owner.</li>
                            </ul>
                            <p className="mt-2">Once it's finished, the phone will show the standard home screen, and the security app will be installed.</p>
                        </div>
                    </div>
                    
                    {/* Step 4 */}
                     <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="flex-shrink-0 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">4</div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">Final FRP Lock (Crucial)</h2>
                            <p>This is the most important step to prevent bypasses. This step activates Google's Factory Reset Protection (FRP), which makes the phone unusable if it's reset from recovery mode.</p>
                             <ol className="list-decimal list-inside space-y-2 mt-4">
                                <li>On the phone, go to <code className="bg-gray-100 px-1 rounded text-sm">Settings &gt; Accounts &gt; Add account</code>.</li>
                                <li>Select <strong className="font-semibold">Google</strong>.</li>
                                <li>Sign in with a dedicated Google account that your shop owns and controls. <strong className="font-semibold text-red-600">Do NOT use a customer's account or a personal account.</strong></li>
                            </ol>
                            <p className="mt-2">Once signed in, the phone is fully protected by FRP.</p>
                        </div>
                    </div>

                </div>

                 <div className="mt-12 text-center bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <p className="font-bold text-xl text-green-800">Device Fully Secured!</p>
                    <p className="text-green-700 mt-1">The phone is now protected by both the Device Owner app and Google's FRP. You can now give it to the customer.</p>
                </div>
            </div>
        </AnimateOnScroll>
    );
};

export default SecurityGuide;