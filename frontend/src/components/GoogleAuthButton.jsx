import { useEffect, useRef, useState } from "react";
import axios from "axios";

const GOOGLE_IDENTITY_SCRIPT = "https://accounts.google.com/gsi/client";
let googleIdentityScriptPromise;

function loadGoogleIdentityScript() {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT;
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => {
        googleIdentityScriptPromise = null;
        reject(new Error("Google sign-in could not be loaded"));
      };
      document.head.appendChild(script);
    });
  }

  return googleIdentityScriptPromise;
}

function GoogleAuthButton({
  onCredential,
  buttonText = "continue_with",
  disabled = false
}) {
  const buttonRef = useRef(null);
  const credentialHandlerRef = useRef(onCredential);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let active = true;
    const buttonContainer = buttonRef.current;

    axios.get("/api/auth/google/config")
      .then(({ data }) => {
        if (!data.clientId) {
          if (active) setStatus("unconfigured");
          return null;
        }

        return loadGoogleIdentityScript().then(() => {
          if (!active || !buttonContainer) return;

          window.google.accounts.id.initialize({
            client_id: data.clientId,
            callback: (response) => {
              if (response.credential) {
                credentialHandlerRef.current(response.credential);
              }
            },
            auto_select: false
          });

          const width = Math.min(
            Math.floor(buttonContainer.getBoundingClientRect().width || 400),
            400
          );
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: "outline",
            size: "large",
            shape: "rectangular",
            text: buttonText,
            width
          });
          setStatus("ready");
        });
      })
      .catch(() => {
        if (active) setStatus("error");
      });

    return () => {
      active = false;
      if (buttonContainer) buttonContainer.replaceChildren();
    };
  }, [buttonText]);

  if (status === "unconfigured") {
    return (
      <p className="googleAuthNote" role="status">
        Google sign-in is not configured yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="googleAuthNote" role="status">
        Google sign-in could not load. Refresh the page and try again.
      </p>
    );
  }

  return (
    <div className="googleAuthBlock">
      {status === "loading" && (
        <p className="googleAuthLoading">Loading Google sign-in…</p>
      )}
      <div
        className={`googleAuthWidget${disabled ? " isDisabled" : ""}`}
        ref={buttonRef}
        aria-disabled={disabled}
        aria-label="Google sign-in"
      />
    </div>
  );
}

export default GoogleAuthButton;
