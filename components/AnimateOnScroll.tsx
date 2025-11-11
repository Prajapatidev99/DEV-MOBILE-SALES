import * as React from 'react';

interface AnimateOnScrollProps {
    children: React.ReactNode;
    className?: string;
    animationClass?: string;
    threshold?: number;
    triggerOnce?: boolean;
}

const AnimateOnScroll: React.FC<AnimateOnScrollProps> = ({
    children,
    className = '',
    animationClass = 'animate-scroll-reveal',
    threshold = 0.1,
    triggerOnce = true
}) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const ref = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (triggerOnce && ref.current) {
                        observer.unobserve(ref.current);
                    }
                } else if (!triggerOnce) {
                    setIsVisible(false);
                }
            },
            { threshold }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [ref, threshold, triggerOnce]);

    return (
        <div ref={ref} className={`${className} transition-all duration-700 ease-out ${isVisible ? animationClass : 'opacity-0 translate-y-5'}`}>
            {children}
        </div>
    );
};

export default AnimateOnScroll;