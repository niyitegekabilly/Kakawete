import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { CreateEventModal } from './components/CreateEventModal';
import { JoinEventModal } from './components/JoinEventModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ParticipantRegisterView } from './components/ParticipantRegisterView';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { SecretAssignmentView } from './components/SecretAssignmentView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { api } from './api';
import type { PublicEventInfo } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'register' | 'secret' | 'admin'>('landing');
  const [activeEventCode, setActiveEventCode] = useState<string>('');
  const [activeSecretToken, setActiveSecretToken] = useState<string>('');
  const [activeAdminToken, setActiveAdminToken] = useState<string>('');
  const [eventInfo, setEventInfo] = useState<PublicEventInfo | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    const pathname = window.location.pathname;

    const secretMatch = pathname.match(/\/event\/([A-Za-z0-9_-]+)\/my-secret\/([A-Za-z0-9_-]+)/);
    if (secretMatch) {
      const [, code, token] = secretMatch;
      setActiveEventCode(code.toUpperCase());
      setActiveSecretToken(token);
      setCurrentView('secret');
      loadPublicEvent(code.toUpperCase());
      return;
    }

    const joinMatch = pathname.match(/\/(?:join|event)\/([A-Za-z0-9_-]+)/);
    if (joinMatch) {
      const [, code] = joinMatch;
      setActiveEventCode(code.toUpperCase());
      loadPublicEvent(code.toUpperCase(), 'register');
      return;
    }
  }, []);

  const loadPublicEvent = async (code: string, targetView?: 'register') => {
    try {
      const res = await api.getPublicEvent(code);
      setEventInfo(res);
      if (targetView) {
        setCurrentView(targetView);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
    }
  };

  const handleOpenDemo = async (role: 'bosco' | 'alice' | 'admin' = 'admin') => {
    const demoCode = 'VJN-XMAS-8K4P';
    setActiveEventCode(demoCode);
    await loadPublicEvent(demoCode);

    if (role === 'bosco') {
      setActiveSecretToken('bosco-token-77a1');
      setCurrentView('secret');
    } else if (role === 'alice') {
      setActiveSecretToken('alice-token-99b2');
      setCurrentView('secret');
    } else {
      try {
        const loginRes = await api.adminLogin(demoCode, '1234');
        setActiveAdminToken(loginRes.adminToken);
        setCurrentView('admin');
      } catch (err) {
        setIsAdminLoginOpen(true);
      }
    }
  };

  const handleEventCreated = (code: string, adminToken: string) => {
    setIsCreateOpen(false);
    setActiveEventCode(code);
    setActiveAdminToken(adminToken);
    loadPublicEvent(code);
    setCurrentView('admin');
  };

  const handleJoinCode = (code: string) => {
    setIsJoinOpen(false);
    setActiveEventCode(code);
    loadPublicEvent(code, 'register');
  };

  const handleSecretToken = (code: string, token: string) => {
    setIsJoinOpen(false);
    setActiveEventCode(code);
    setActiveSecretToken(token);
    loadPublicEvent(code);
    setCurrentView('secret');
  };

  const handleParticipantRegistered = (token: string) => {
    setActiveSecretToken(token);
    setCurrentView('secret');
  };

  const handleAdminLoginSuccess = (adminToken: string) => {
    setActiveAdminToken(adminToken);
    setCurrentView('admin');
  };

  const handleSelectTab = (tab: 'home' | 'secret' | 'admin') => {
    if (tab === 'home') {
      setCurrentView('landing');
    } else if (tab === 'secret') {
      if (!activeSecretToken) {
        if (!activeEventCode) {
          setIsJoinOpen(true);
        } else {
          setCurrentView('register');
        }
      } else {
        setCurrentView('secret');
      }
    } else if (tab === 'admin') {
      if (activeAdminToken) {
        setCurrentView('admin');
      } else {
        setIsAdminLoginOpen(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] text-slate-900 selection:bg-rose-100 selection:text-rose-900 font-sans">
      <Navbar
        currentView={currentView}
        onNavigateHome={() => setCurrentView('landing')}
        onCreateEvent={() => setIsCreateOpen(true)}
        onJoinEvent={() => setIsJoinOpen(true)}
        onOpenAdmin={() => setIsAdminLoginOpen(true)}
        activeEventCode={activeEventCode}
        isAdmin={Boolean(activeAdminToken)}
      />

      <main className="flex-1 w-full">
        {currentView === 'landing' && (
          <LandingView
            onJoinEvent={() => setIsJoinOpen(true)}
          />
        )}

        {currentView === 'register' && eventInfo && (
          <ParticipantRegisterView
            event={eventInfo}
            onRegistered={handleParticipantRegistered}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'admin' && activeEventCode && activeAdminToken && (
          <OrganizerDashboard
            eventCode={activeEventCode}
            adminToken={activeAdminToken}
            onLogout={() => {
              setActiveAdminToken('');
              setCurrentView('landing');
            }}
            onViewAsParticipant={(token) => {
              setActiveSecretToken(token);
              setCurrentView('secret');
            }}
            onCreateNewEvent={() => setIsCreateOpen(true)}
          />
        )}

        {currentView === 'secret' && activeEventCode && activeSecretToken && (
          <SecretAssignmentView
            eventCode={activeEventCode}
            secretToken={activeSecretToken}
            onNavigateHome={() => setCurrentView('landing')}
          />
        )}
      </main>

      <MobileBottomNav
        activeTab={
          currentView === 'landing'
            ? 'home'
            : currentView === 'secret'
            ? 'secret'
            : 'admin'
        }
        onSelectTab={handleSelectTab}
        hasActiveEvent={Boolean(activeSecretToken)}
        isAdmin={Boolean(activeAdminToken)}
      />

      <CreateEventModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleEventCreated}
      />

      <JoinEventModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onJoinCode={handleJoinCode}
        onSecretToken={handleSecretToken}
      />

      {activeEventCode && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          eventCode={activeEventCode}
          onSuccess={handleAdminLoginSuccess}
        />
      )}
    </div>
  );
}
