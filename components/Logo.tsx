import * as React from 'react';
import * as api from '../api';
import type { User } from '../types';

interface AuthProps {
    onClose: () => void;
    onAuthSuccess: (user: User) => void;
    onSignup: (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean) => void;
}

type AuthMode = 'login' | 'signup' | 'loginOtp' | 'forgotPassword' | 'resetPassword';

const Auth: React.FC<AuthProps> = ({ onClose, onAuthSuccess, onSignup }) => {
    const [mode, setMode] = React.useState<AuthMode>('login');
    const [animation, setAnimation] = React.useState<{ current: AuthMode; previous: AuthMode | null }>({ current: 'login', previous: null });
    
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
        setAnimation({ current: newMode, previous: mode });
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
    
    const getAnimationClass = (formMode: AuthMode) => {
        const { current, previous } = animation;
        if (formMode === current && previous !== null) {
            return 'form-slide-in-right';
        }
        if (formMode === previous) {
            return 'form-slide-out-left';
        }
        return '';
    };

    const renderForm = (formMode: AuthMode) => {
        const loadingButtonClasses = "w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 flex items-center justify-center";
        const inputClasses = "w-full px-4 py-3 bg-gray-100 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow input-with-icon";

        let content;
        switch (formMode) {
             case 'login': content = (
                <div className="space-y-4">
                     <div className="input-icon-wrapper">
                        <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                        <input id="identifier" placeholder="Email or Mobile" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={inputClasses} />
                    </div>
                     <div className="input-icon-wrapper">
                        <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input id="password" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} />
                    </div>
                </div>
            ); break;
            case 'signup': content = (
                <div className="space-y-3">
                    <div className="input-icon-wrapper"><svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg><input placeholder="Full Name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputClasses}/></div>
                    <div className="input-icon-wrapper"><svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg><input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClasses} /></div>
                    <div className="input-icon-wrapper"><svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg><input placeholder="Mobile Number" type="tel" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} required className={inputClasses} /></div>
                    <div className="input-icon-wrapper"><svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className={inputClasses} /></div>
                </div>
            ); break;
            case 'loginOtp': content = (
                <div>
                     <div className="input-icon-wrapper">
                        <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input placeholder="Enter OTP" type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} required className={`${inputClasses} text-center tracking-[.5em] text-2xl`} autoFocus />
                    </div>
                </div>
            ); break;
            case 'forgotPassword': content = (
                <div className="input-icon-wrapper">
                    <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" /></svg>
                    <input placeholder="Email or Mobile" type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className={inputClasses} autoFocus />
                </div>
            ); break;
             case 'resetPassword': content = (
                <div className="space-y-4">
                     <div className="input-icon-wrapper">
                        <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input placeholder="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputClasses} autoFocus />
                    </div>
                    <div className="input-icon-wrapper">
                        <svg className="icon w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <input placeholder="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputClasses} />
                    </div>
                </div>
            ); break;
        }

        return (
            <div className={`absolute w-full px-8 ${getAnimationClass(formMode)}`}>
                <form onSubmit={
                    formMode === 'login' ? handleLoginSubmit :
                    formMode === 'signup' ? handleSignupSubmit :
                    formMode === 'loginOtp' ? handleOtpSubmit :
                    formMode === 'forgotPassword' ? handleForgotSubmit : handleResetSubmit
                }>
                    <div className="space-y-4">
                        {content}
                        {formMode === 'signup' && <div className="pt-2"><label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer"><input type="checkbox" checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} className="rounded h-4 w-4" /><span>I agree to receive promotional messages.</span></label></div>}
                        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                        <button type="submit" disabled={isLoading} className={loadingButtonClasses}>
                            {isLoading ? <><span className="spinner-border mr-2" /> Processing...</> : 
                                (formMode === 'login' ? 'Login with OTP' :
                                formMode === 'signup' ? 'Create Account' :
                                formMode === 'loginOtp' ? 'Verify & Login' :
                                formMode === 'forgotPassword' ? 'Find Account' : 'Update Password')
                            }
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-6 text-gray-400 hover:text-black text-3xl transition-colors z-20">&times;</button>
                
                {/* Left Decorative Panel */}
                <div className="hidden md:block w-1/2 bg-gray-800 p-12 text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute -top-10 -left-10 w-48 h-48 bg-blue-500/20 rounded-full"></div>
                    <div className="absolute -bottom-16 -right-5 w-40 h-40 bg-yellow-400/20 rounded-full"></div>
                    <h1 className="text-4xl font-bold tracking-tighter mb-4 z-10">Dev Mobile</h1>
                    <p className="text-gray-300 text-lg z-10">Your one-stop shop for the latest and greatest in mobile technology.</p>
                </div>

                {/* Right Form Panel */}
                <div className="w-full md:w-1/2 flex flex-col justify-center items-center relative">
                    <div className="w-full relative h-full flex flex-col justify-center items-center">
                        <div className="w-full h-80 relative"> {/* Container to hold sliding forms */}
                             {mode === 'login' && renderForm('login')}
                             {mode === 'signup' && renderForm('signup')}
                             {mode === 'loginOtp' && renderForm('loginOtp')}
                             {mode === 'forgotPassword' && renderForm('forgotPassword')}
                             {mode === 'resetPassword' && renderForm('resetPassword')}

                             {animation.previous === 'login' && renderForm('login')}
                             {animation.previous === 'signup' && renderForm('signup')}
                             {animation.previous === 'loginOtp' && renderForm('loginOtp')}
                             {animation.previous === 'forgotPassword' && renderForm('forgotPassword')}
                             {animation.previous === 'resetPassword' && renderForm('resetPassword')}
                        </div>
                    </div>
                    <div className="absolute bottom-10 text-center text-sm text-gray-500">
                        {mode === 'login' && <p>Don't have an account? <button onClick={() => switchMode('signup')} className="font-semibold text-blue-600 hover:underline">Sign Up</button></p>}
                        {mode === 'signup' && <p>Already have an account? <button onClick={() => switchMode('login')} className="font-semibold text-blue-600 hover:underline">Login</button></p>}
                        {mode === 'loginOtp' && <p>Didn't receive code? <button onClick={() => alert(`(DEMO) Your OTP is: 123456`)} className="font-semibold text-blue-600 hover:underline">Resend</button></p>}
                        {mode === 'forgotPassword' && <p>Remembered your password? <button onClick={() => switchMode('login')} className="font-semibold text-blue-600 hover:underline">Back to Login</button></p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
