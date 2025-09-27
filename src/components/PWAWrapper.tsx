'use client';

import { useEffect } from 'react';
import { initializePWA, getInstallStatus, showInstallPrompt } from '@/src/lib/pwa';

export function PWAWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize PWA features when component mounts
    if (typeof window !== 'undefined') {
      initializePWA();
    }
  }, []);

  return <>{children}</>;
}

// Install prompt component for PWA
export function InstallPrompt() {
  useEffect(() => {
    const handleInstallPrompt = () => {
      showInstallPrompt();
    };

    // Add event listener for install button if it exists
    const installBtn = document.getElementById('install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', handleInstallPrompt);

      return () => {
        installBtn.removeEventListener('click', handleInstallPrompt);
      };
    }
  }, []);

  const handleInstall = async () => {
    const success = await showInstallPrompt();
    if (success) {
      console.log('App installation initiated');
    }
  };

  const status = typeof window !== 'undefined' ? getInstallStatus() : { isInstalled: false, canInstall: false, platform: 'web' };

  // Don't show install prompt if already installed or can't install
  if (status.isInstalled || !status.canInstall) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-primary text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Install HealthPro</h3>
          <p className="text-xs opacity-90">Add to your home screen for a better experience</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="bg-white text-primary px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Install
          </button>
          <button
            onClick={() => {
              const element = document.querySelector('.install-prompt') as HTMLElement;
              if (element) element.style.display = 'none';
            }}
            className="text-white/80 hover:text-white text-sm px-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}