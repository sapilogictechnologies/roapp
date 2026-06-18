import React, { useEffect, useState } from 'react';

const DISMISSED_KEY = 'ro_pwa_install_dismissed';

export default function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
      setPromptEvent(event);
      setVisible(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  }, []);

  const install = async () => {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice.catch(() => null);
    setVisible(false);
    setPromptEvent(null);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl shadow-slate-200 sm:left-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-sm font-black text-white">RO</div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900">Install AquaFlow</p>
          <p className="mt-1 text-sm text-slate-500">Use the app faster with offline shell support and home-screen access.</p>
          <div className="mt-3 flex gap-2">
            <button onClick={install} className="btn-primary btn-sm">Install</button>
            <button onClick={dismiss} className="btn-secondary btn-sm">Not now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
