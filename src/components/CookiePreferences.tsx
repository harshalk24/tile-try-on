import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "nazaraa_cookie_consent";

interface CookiePreferences {
  essential: boolean;
  performance: boolean;
  functionality: boolean;
  targeting: boolean;
}

interface CookiePreferencesProps {
  embedded?: boolean;
}

const CookiePreferences = ({ embedded = false }: CookiePreferencesProps) => {
  const [isOpen, setIsOpen] = useState(embedded);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    performance: false,
    functionality: false,
    targeting: false,
  });

  useEffect(() => {
    // Check if user has already set preferences
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed);
      } catch (e) {
        console.error("Error parsing cookie preferences:", e);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setIsOpen(false);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      performance: true,
      functionality: true,
      targeting: true,
    };
    savePreferences(allAccepted);
  };

  const handleRejectAll = () => {
    const allRejected: CookiePreferences = {
      essential: true, // Essential cookies cannot be rejected
      performance: false,
      functionality: false,
      targeting: false,
    };
    savePreferences(allRejected);
  };

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === "essential") return; // Essential cookies cannot be toggled
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
  };

  if (!embedded && !isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="fixed bottom-4 right-4 z-50 bg-white shadow-lg"
      >
        <Cookie className="h-4 w-4 mr-2" />
        Cookie Preferences
      </Button>
    );
  }

  return (
    <div className={embedded ? "w-full" : "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"}>
      <div className={`bg-white ${embedded ? "rounded-lg border border-[#E6E6E6]" : "rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"}`}>
        <div className={`${embedded ? "border-b" : "sticky top-0 border-b"} bg-white p-6 flex items-center justify-between`}>
          <h2 className="text-2xl font-bold text-[#222]">Cookie Preferences</h2>
          {!embedded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="p-6 space-y-6">
          <p className="text-[#222]/70">
            Manage your cookie preferences. You can enable or disable different types of cookies below.
          </p>

          {/* Essential Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-[#222]">Essential Cookies</h3>
                <p className="text-sm text-[#222]/70">
                  Required for the website to function properly. These cannot be disabled.
                </p>
              </div>
              <div className="px-3 py-1 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full text-sm font-medium">
                Always On
              </div>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-[#222]">Performance Cookies</h3>
                <p className="text-sm text-[#222]/70">
                  Help us understand how visitors interact with our website.
                </p>
              </div>
              <button
                onClick={() => handleToggle("performance")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.performance ? "bg-[#FF6B35]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.performance ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Functionality Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-[#222]">Functionality Cookies</h3>
                <p className="text-sm text-[#222]/70">
                  Remember your preferences and provide enhanced features.
                </p>
              </div>
              <button
                onClick={() => handleToggle("functionality")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.functionality ? "bg-[#FF6B35]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.functionality ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Targeting Cookies */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-[#222]">Targeting/Advertising Cookies</h3>
                <p className="text-sm text-[#222]/70">
                  Used to deliver relevant advertisements and measure campaign effectiveness.
                </p>
              </div>
              <button
                onClick={() => handleToggle("targeting")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.targeting ? "bg-[#FF6B35]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.targeting ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className={`${embedded ? "border-t" : "sticky bottom-0 border-t"} bg-white p-6 flex gap-3 justify-end`}>
          <Button
            variant="outline"
            onClick={handleRejectAll}
            className="border-[#E6E6E6]"
          >
            Reject All
          </Button>
          <Button
            variant="outline"
            onClick={handleSavePreferences}
            className="border-[#E6E6E6]"
          >
            Save Preferences
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="bg-[#FF6B35] hover:bg-[#E55A2B] text-white"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;

