import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilitySettings {
  highContrast: boolean;
  colorBlindFriendly: boolean;
  textScale: number;
  keyboardNavigation: boolean;
  largeClickTargets: boolean;
  dyslexiaFriendly: boolean;
  screenReaderSupport: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  highContrast: false,
  colorBlindFriendly: false,
  textScale: 100,
  keyboardNavigation: false,
  largeClickTargets: false,
  dyslexiaFriendly: false,
  screenReaderSupport: true,
};

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        applySettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error('Error loading accessibility settings:', e);
      }
    } else {
      applySettings(DEFAULT_SETTINGS);
    }
  }, []);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const html = document.documentElement;
    const body = document.body;

    if (newSettings.highContrast) {
      html.classList.add('accessibility-high-contrast');
      body.classList.add('accessibility-high-contrast');
    } else {
      html.classList.remove('accessibility-high-contrast');
      body.classList.remove('accessibility-high-contrast');
    }

    if (newSettings.colorBlindFriendly) {
      html.classList.add('accessibility-colorblind');
    } else {
      html.classList.remove('accessibility-colorblind');
    }

    html.style.fontSize = `${newSettings.textScale}%`;

    if (newSettings.keyboardNavigation) {
      html.classList.add('accessibility-keyboard-nav');
    } else {
      html.classList.remove('accessibility-keyboard-nav');
    }

    if (newSettings.largeClickTargets) {
      html.classList.add('accessibility-large-targets');
    } else {
      html.classList.remove('accessibility-large-targets');
    }

    if (newSettings.dyslexiaFriendly) {
      html.classList.add('accessibility-dyslexia-font');
    } else {
      html.classList.remove('accessibility-dyslexia-font');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibilitySettings', JSON.stringify(newSettings));
      applySettings(newSettings);
      return newSettings;
    });
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
};

