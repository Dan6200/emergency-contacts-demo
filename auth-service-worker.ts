import { FirebaseOptions, initializeApp } from "firebase/app";
import { Auth, getAuth, getIdToken } from "firebase/auth";
import { getInstallations, getToken } from "firebase/installations";
import { NextRequest } from "next/server";

let firebaseConfig: FirebaseOptions;

self.addEventListener("install", (event) => {
  const serializedFirebaseConfig = new URL(
    <URL>(<unknown>location)
  ).searchParams.get("firebaseConfig");

  if (!serializedFirebaseConfig) {
    throw new Error(
      "Firebase Config object not found in service worker query string."
    );
  }

  firebaseConfig = JSON.parse(serializedFirebaseConfig);
  console.log("Service worker installed with Firebase config", firebaseConfig);
});

const isFetchEvent = (event: Event): event is FetchEvent => "request" in event;

self.addEventListener("fetch", (event: Event) => {
  console.log("fetch event fired");
  if (!isFetchEvent(event)) throw new Error("Event must be of type FetchEvent");
  const { origin } = new URL(event.request.url);
  if (origin !== self.location.origin) return;
  event.respondWith(fetchWithFirebaseHeaders(<NextRequest>event.request));
});

async function fetchWithFirebaseHeaders(request: NextRequest) {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const installations = getInstallations(app);
  const headers = new Headers(request.headers);
  const [authIdToken, installationToken] = await Promise.all([
    getAuthIdToken(auth),
    getToken(installations),
  ]);
  headers.append("Firebase-Instance-ID-Token", installationToken);
  if (authIdToken) headers.append("Authorization", `Bearer ${authIdToken}`);
  const newRequest = new Request(request, { headers });
  return await fetch(newRequest);
}

async function getAuthIdToken(auth: Auth) {
  await auth.authStateReady();
  if (!auth.currentUser) return;
  return await getIdToken(auth.currentUser);
}
