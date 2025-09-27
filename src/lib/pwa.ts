// PWA Service Worker Registration and Management

// Register Service Worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('PWA: Service Worker registered successfully:', registration);

      // Handle service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('PWA: New service worker available');
              showUpdateNotification();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('PWA: Service Worker registration failed:', error);
      return null;
    }
  } else {
    console.log('PWA: Service Worker not supported');
    return null;
  }
}

// Show update notification to user
function showUpdateNotification() {
  // You can implement a custom UI notification here
  if (confirm('A new version of the app is available. Update now?')) {
    window.location.reload();
  }
}

// Install PWA prompt handling
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt(): Promise<void>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

// Listen for beforeinstallprompt event
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('PWA: Install prompt deferred');

    // Optionally show your own install promotion UI
    showInstallPromotion();
  });

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA: App was installed');
    deferredPrompt = null;
    hideInstallPromotion();
  });
}

// Show install promotion
function showInstallPromotion(): void {
  // You can implement custom install UI here
  console.log('PWA: App can be installed');

  // Example: Add install button to UI
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.display = 'block';
  }
}

// Hide install promotion
function hideInstallPromotion(): void {
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.style.display = 'none';
  }
}

// Trigger install prompt
export async function showInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('PWA: Install prompt not available');
    return false;
  }

  try {
    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user to respond
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`PWA: User ${outcome} the install prompt`);

    deferredPrompt = null;

    return outcome === 'accepted';
  } catch (error) {
    console.error('PWA: Error showing install prompt:', error);
    return false;
  }
}

// Check if app is installed
export function isAppInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as { standalone?: boolean }).standalone === true ||
         document.referrer.includes('android-app://');
}

// Get app install status
export function getInstallStatus(): {
  isInstalled: boolean;
  canInstall: boolean;
  platform: string;
} {
  const isInstalled = isAppInstalled();
  const canInstall = !!deferredPrompt;

  let platform = 'web';
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    platform = 'ios';
  } else if (/Android/.test(navigator.userAgent)) {
    platform = 'android';
  }

  return {
    isInstalled,
    canInstall,
    platform
  };
}

// Initialize PWA features
export function initializePWA(): void {
  // Register service worker
  registerServiceWorker();

  // Setup install prompt handling
  setupInstallPrompt();

  // Log PWA status
  console.log('PWA: Initialization complete', getInstallStatus());
}

// Background sync for offline data
export async function scheduleBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
      if (syncManager) {
        await syncManager.register(tag);
        console.log(`PWA: Background sync scheduled: ${tag}`);
      }
    } catch (error) {
      console.error('PWA: Background sync registration failed:', error);
    }
  }
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    console.log('PWA: Notification permission:', permission);
    return permission;
  }
  return 'denied';
}