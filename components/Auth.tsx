import * as React from 'react';
import * as api from '../api';
import type { User } from '../types';

interface AuthProps {
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
    onSignup: (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'loginOtp' | 'forgotPassword' | 'resetPassword';

const FloatingLabelInput: React.FC<{ id: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, required?: boolean, [key: string]: any }> = 
({ id, type, value, onChange, label, required = false, ...props }) => (
    <div className="relative">
        <input
            id={id}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder=" " 
            className="block px-3 pb-2 pt-4 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 peer floating-label-input"
            {...props}
        />
        <label
            htmlFor={id}
            className="absolute text-sm duration-300 transform -translate-y-4 scale-75 top-4 z-10 origin-[0] start-3 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto"
        >
            {label}
        </label>
    </div>
);

const SocialLogins: React.FC<{ onSocialLogin: (provider: 'google' | 'facebook') => void }> = ({ onSocialLogin }) => (
    <>
        <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => onSocialLogin('google')} className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.641-3.657-11.303-8.657l-6.571 4.819C9.656 39.663 16.318 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.592 35.631 48 29.692 48 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                Google
            </button>
             <button type="button" onClick={() => onSocialLogin('facebook')} className="flex items-center justify-center gap-2 w-full py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                Facebook
            </button>
        </div>
    </>
);

const Auth: React.FC<AuthProps> = ({ onClose, onAuthSuccess, onSignup }) => {
    const [mode, setMode] = React.useState<AuthMode>('login');
    
    // Form fields
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [mobile, setMobile] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [identifier, setIdentifier] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [marketingConsent, setMarketingConsent] = React.useState(true);

    // State management
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const userForOtp = React.useRef<User | null>(null);
    const identifierForReset = React.useRef<string>('');

    const resetForm = () => {
        setName('');
        setEmail('');
        setMobile('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIdentifier('');
        setOtp('');
        setError(null);
    }

    const switchMode = (newMode: AuthMode) => {
        resetForm();
        setMode(newMode);
    }

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            const user = await api.login(identifier, password);
            userForOtp.current = user;
            alert(`(DEMO) In a real app, an OTP would be sent to your registered mobile/email via SMS or WhatsApp.\n\nYour OTP is: 123456`);
            switchMode('loginOtp');
        } catch (err) {
            setError((err as Error).message);
        }
        setIsLoading(false);
    };

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        onSignup(name, email, password, mobile, marketingConsent);
        setIsLoading(false);
    }

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (otp === '123456' && userForOtp.current) {
            api.finalizeLogin(userForOtp.current);
            onAuthSuccess(userForOtp.current);
        } else {
            setError('Invalid OTP. Please try again.');
        }
        setIsLoading(false);
    };

    const handleForgotSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await api.findUserByIdentifier(identifier);
            identifierForReset.current = identifier;
            switchMode('resetPassword');
        } catch (err) {
            setError((err as Error).message);
        }
        setIsLoading(false);
    }

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        setError(null);
        setIsLoading(true);
        try {
            await api.updatePassword(identifierForReset.current, newPassword);
            alert('Password has been updated successfully. Please log in with your new password.');
            switchMode('login');
        } catch (err) {
            setError((err as Error).message);
        }
        setIsLoading(false);
    }
    
    const handleSocialLogin = async (provider: 'google' | 'facebook') => {
        setIsLoading(true);
        setError(null);
        try {
            let mockUserData: Omit<User, 'id' | 'password'>;
            if (provider === 'google') {
                mockUserData = {
                    name: 'Google User',
                    email: 'google.user@example.com',
                    role: 'customer',
                    mobile: '9999999999',
                };
            } else { // facebook
                mockUserData = {
                    name: 'Facebook User',
                    email: 'facebook.user@example.com',
                    role: 'customer',
                    mobile: '8888888888',
                };
            }

            const user = await api.findOrCreateSocialUser(mockUserData);
            api.finalizeLogin(user); // Set the session
            onAuthSuccess(user); // Trigger the success callback, which will close the modal
        } catch (err) {
            setError("Social login failed. Please try again.");
            setIsLoading(false); // Only stop loading on error, as success unmounts the component
        }
    };


    const renderContent = () => {
        return (
            <div key={mode} className="animate-content-in">
            {(() => {
                switch (mode) {
                    case 'login': return (
                        <>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Login</h2>
                            <p className="text-gray-500 mb-6">Welcome back! Log in to access your account.</p>
                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <FloatingLabelInput id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} label="Email or Mobile" required />
                                <div>
                                    <FloatingLabelInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" required />
                                    <button type="button" onClick={() => switchMode('forgotPassword')} className="text-xs text-blue-600 hover:underline mt-1 float-right">Forgot Password?</button>
                                </div>
                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 disabled:bg-gray-400">
                                    {isLoading ? 'Processing...' : 'Login'}
                                </button>
                            </form>
                            <SocialLogins onSocialLogin={handleSocialLogin} />
                            <p className="text-center mt-6 text-sm text-gray-500">
                                Don't have an account?
                                <button onClick={() => switchMode('signup')} className="font-semibold text-blue-600 hover:underline ml-2">Sign Up</button>
                            </p>
                        </>
                    );
                    case 'signup': return (
                        <>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Sign Up</h2>
                            <p className="text-gray-500 mb-6">Create an account to save your wishlist and track orders.</p>
                            <form onSubmit={handleSignupSubmit} className="space-y-6">
                                <FloatingLabelInput id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} label="Name" required />
                                <FloatingLabelInput id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} label="Email" required />
                                <FloatingLabelInput id="mobile" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} label="Mobile Number" required />
                                <FloatingLabelInput id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} label="Password" required />
                                <div className="pt-2"><label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"><input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} className="rounded h-4 w-4" /><span>I agree to receive promotional messages.</span></label></div>
                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 disabled:bg-gray-400">{isLoading ? 'Processing...' : 'Create Account'}</button>
                            </form>
                            <p className="text-center mt-6 text-sm text-gray-500">
                                Already have an account?
                                <button onClick={() => switchMode('login')} className="font-semibold text-blue-600 hover:underline ml-2">Login</button>
                            </p>
                        </>
                    );
                    case 'loginOtp': return (
                        <>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Two-Step Verification</h2>
                            <p className="text-gray-500 mb-6 px-4">A 6-digit code has been sent to your registered mobile/email. Please enter it below.</p>
                            <form onSubmit={handleOtpSubmit} className="space-y-4">
                                <FloatingLabelInput id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} label="One-Time Password (OTP)" required autoFocus />
                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 disabled:bg-gray-400">{isLoading ? 'Verifying...' : 'Verify & Login'}</button>
                            </form>
                            <p className="text-center mt-6 text-sm text-gray-500">
                                Didn't receive the code?
                                <button onClick={() => alert(`(DEMO) In a real app, a new OTP would be sent via SMS/WhatsApp.\n\nYour OTP is: 123456`)} className="font-semibold text-blue-600 hover:underline ml-2">Resend Code</button>
                            </p>
                        </>
                    );
                    case 'forgotPassword': return (
                         <>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Forgot Password</h2>
                            <p className="text-gray-500 mb-6 px-4">Enter your email or mobile number to reset your password.</p>
                            <form onSubmit={handleForgotSubmit} className="space-y-6">
                                <FloatingLabelInput id="identifier" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} label="Email or Mobile Number" required autoFocus />
                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 disabled:bg-gray-400">{isLoading ? 'Searching...' : 'Find Account'}</button>
                            </form>
                            <p className="text-center mt-6 text-sm text-gray-500">
                                Remembered your password?
                                <button onClick={() => switchMode('login')} className="font-semibold text-blue-600 hover:underline ml-2">Back to Login</button>
                            </p>
                        </>
                    );
                    case 'resetPassword': return (
                        <>
                            <h2 className="text-3xl font-bold mb-2 text-gray-800">Reset Password</h2>
                            <p className="text-gray-500 mb-6 px-4">Please create a new password for your account.</p>
                            <form onSubmit={handleResetSubmit} className="space-y-6">
                                <FloatingLabelInput id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} label="New Password" required autoFocus />
                                <FloatingLabelInput id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} label="Confirm New Password" required />
                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                                <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300 disabled:bg-gray-400">{isLoading ? 'Updating...' : 'Update Password'}</button>
                            </form>
                        </>
                    );
                    default: return null;
                }
            })()}
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative grid grid-cols-1 md:grid-cols-2 overflow-hidden min-h-[600px] md:min-h-[650px]">
                 <div className="hidden md:flex flex-col justify-center items-center text-center p-8 text-white animated-gradient">
                    <a href="#/home" className="group text-4xl font-bold text-white tracking-tighter mb-4">
                        <span className="transition-colors group-hover:text-yellow-300">Dev</span>
                        <span className="text-gray-300"> Mobile</span>
                    </a>
                    <p className="text-gray-300 max-w-xs mt-2 text-lg">Your one-stop shop for the latest in mobile technology.</p>
                </div>
                <div className="relative p-6 sm:p-10 flex flex-col justify-center">
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black text-3xl transition-colors">&times;</button>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Auth;