import { Providers } from "@/components/providers/Providers";
import { FlashcardGenerationView } from "./FlashcardGenerationView";
import type { User } from '@supabase/supabase-js';
import { ThreePanelLayout } from "./ThreePanelLayout";
import { useState, useEffect } from "react";
import { FlashcardsList } from "./flashcards/FlashcardsList";
import { Navbar } from './Navbar';
import type { Panel } from './ThreePanelLayout';

interface FlashcardGenerationViewWrapperProps {
    initialUser: Pick<User, 'id' | 'email'>;
}

export function FlashcardGenerationViewWrapper({ initialUser }: FlashcardGenerationViewWrapperProps) {
    const [mounted, setMounted] = useState(false);
    const [activePanel, setActivePanel] = useState<Panel>(() => {
        // Get the panel from URL parameter, default to 'builder' if not specified
        const params = new URLSearchParams(window.location.search);
        const panel = params.get('panel');
        return (panel === 'collections' || panel === 'builder') ? panel : 'builder';
    });

    // Initialize mounted state
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update URL when panel changes
    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('panel', activePanel);
        window.history.replaceState({}, '', url.toString());
    }, [activePanel]);

    // Collections panel content
    const renderCollectionsPanel = () => (
        <div className="h-full overflow-y-auto">
            <FlashcardsList initialUser={initialUser} />
        </div>
    );

    // Builder panel content
    const renderBuilderPanel = () => (
        <div className="h-full overflow-y-auto">
            <FlashcardGenerationView />
        </div>
    );

    if (!mounted) return null;

    return (
        <Providers initialUser={initialUser}>
            <div className="flex flex-col min-h-screen">
                <Navbar
                    activePanel={activePanel}
                    onPanelChange={setActivePanel}
                    variant="with-nav"
                />
                <div className="flex-1 overflow-hidden">
                    <ThreePanelLayout
                        collectionsPanel={renderCollectionsPanel()}
                        builderPanel={renderBuilderPanel()}
                        defaultPanel={activePanel}
                        onPanelChange={setActivePanel}
                    />
                </div>
            </div>
        </Providers>
    );
} 