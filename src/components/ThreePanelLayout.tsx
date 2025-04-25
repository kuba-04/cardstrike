import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MobileBottomNav } from './MobileBottomNav';
import { cn } from '@/lib/utils';

export type Panel = 'collections' | 'builder';

interface PanelProps {
    children: ReactNode;
    className?: string;
    id: string;
}

const PanelView = ({ children, className, id }: PanelProps) => (
    <div
        id={id}
        className={cn(
            "transition-all duration-300 panel-transition",
            className
        )}
    >
        {children}
    </div>
);

interface ThreePanelLayoutProps {
    collectionsPanel: ReactNode;
    builderPanel: ReactNode;
    defaultPanel?: Panel;
    onPanelChange?: (panel: Panel) => void;
    className?: string;
}

export function ThreePanelLayout({
    collectionsPanel,
    builderPanel,
    defaultPanel = 'builder',
    onPanelChange,
    className
}: ThreePanelLayoutProps) {
    const [activePanel, setActivePanel] = useState<Panel>(defaultPanel);
    const [isMobile, setIsMobile] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Handle resize and set mobile state
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        setMounted(true);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setActivePanel(defaultPanel);
    }, [defaultPanel]);

    if (!mounted) {
        // Return a placeholder with the same structure to prevent layout shift
        return (
            <div className={cn("w-full min-h-screen", className)}>
                <div className="h-[calc(100vh-4rem)]"></div>
            </div>
        );
    }

    // Handle panel change
    const handlePanelChange = (panel: Panel) => {
        setActivePanel(panel);
        onPanelChange?.(panel);

        // Scroll handling for mobile
        if (isMobile) {
            // Scroll to top smoothly when changing panels
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={cn("w-full relative", className)}>
            {/* Desktop Layout */}
            {!isMobile && (
                <div className="w-full px-4 py-6">
                    <PanelView
                        id="collections-panel"
                        className={cn(
                            "w-full transition-opacity duration-300",
                            activePanel === 'collections' ? 'block' : 'hidden'
                        )}
                    >
                        {collectionsPanel}
                    </PanelView>
                    <PanelView
                        id="builder-panel"
                        className={cn(
                            "w-full transition-opacity duration-300",
                            activePanel === 'builder' ? 'block' : 'hidden'
                        )}
                    >
                        {builderPanel}
                    </PanelView>
                </div>
            )}

            {/* Mobile Layout */}
            {isMobile && (
                <div className="pb-16"> {/* Add padding to account for bottom nav */}
                    <PanelView
                        id="collections-panel-mobile"
                        className={cn(
                            "w-full transition-opacity duration-300",
                            activePanel === 'collections' ? 'block panel-enter-active' : 'hidden panel-exit-active'
                        )}
                    >
                        {collectionsPanel}
                    </PanelView>
                    <PanelView
                        id="builder-panel-mobile"
                        className={cn(
                            "w-full transition-opacity duration-300",
                            activePanel === 'builder' ? 'block panel-enter-active' : 'hidden panel-exit-active'
                        )}
                    >
                        {builderPanel}
                    </PanelView>
                </div>
            )}

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <MobileBottomNav
                    activePanel={activePanel}
                    onPanelChange={handlePanelChange}
                />
            )}
        </div>
    );
} 