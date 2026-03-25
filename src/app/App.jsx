import React, { useState } from "react";
import Sidebar from "../components/Sidebar/Sidebar";
import ChatWindow from "../components/Chat/ChatWindow";
import VentArena from "../components/VentArena/VentArena";
import "../styles/theme.css";

export default function App() {
    const [view, setView] = useState('chat'); // 'chat' | 'vent'
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                currentView={view}
                onViewChange={setView}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            {view === 'chat' && (
                <ChatWindow onOpenSidebar={() => setIsSidebarOpen(true)} />
            )}
            {view === 'vent' && (
                <VentArena onOpenSidebar={() => setIsSidebarOpen(true)} />
            )}
        </div>
    );
}
