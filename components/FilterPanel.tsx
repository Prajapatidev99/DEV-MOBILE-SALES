import * as React from 'react';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, children }) => {
    const [animationClass, setAnimationClass] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setAnimationClass('animate-slide-in-right');
        } else if (animationClass) { // Only run outro if it was previously open
            setAnimationClass('animate-slide-out-right');
        }
    }, [isOpen]);

    if (!animationClass) return null;

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            ></div>
            <div 
                className={`fixed top-0 right-0 w-full max-w-sm h-full bg-white shadow-lg z-50 ${animationClass}`}
                onAnimationEnd={() => { if (!isOpen) setAnimationClass(''); }}
            >
                <div className="flex flex-col h-full">
                    <header className="flex items-center justify-between p-4 border-b">
                        <h2 className="text-xl font-bold">Filters & Sort</h2>
                        <button onClick={onClose} className="text-3xl text-gray-400 hover:text-black">&times;</button>
                    </header>
                    <div className="flex-grow overflow-y-auto">
                        {children}
                    </div>
                    <footer className="p-4 border-t">
                        <button onClick={onClose} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg">
                            Apply
                        </button>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default FilterPanel;