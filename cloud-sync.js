import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Replace with your Firebase project's web config values
const firebaseConfig = {
  apiKey: "AIzaSyAxKau75xdIiwPwrAQJwKqW_P7B15zTegY",
  authDomain: "song-leader-app.firebaseapp.com",
  projectId: "song-leader-app",
  storageBucket: "song-leader-app.firebasestorage.app",
  messagingSenderId: "469604828616",
  appId: "1:469604828616:web:e921a8fc1c53defcc46cfd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const LAST_SYNC_KEY = "pftl_last_cloud_sync_v1";

const ui = {
  signedOutBox: document.getElementById("cloudSignedOutBox"),
  signedInBox: document.getElementById("cloudSignedInBox"),
  accountLabel: document.getElementById("cloudAccountLabel"),
  statusLabel: document.getElementById("cloudSyncStatus"),
  signInBtn: document.getElementById("cloudSignInBtn"),
  syncNowBtn: document.getElementById("cloudSyncNowBtn"),
  signOutBtn: document.getElementById("cloudSignOutBtn"),
  deleteBtn: document.getElementById("cloudDeleteBtn"),
};

let currentUser = null;
let syncTimer = null;
let isSyncing = false;

function setStatus(msg) {
  if (!ui.statusLabel) return;
  ui.statusLabel.textContent = msg;
  ui.statusLabel.classList.toggle("hidden", !msg);
}

function getDocRef(uid) {
  return doc(db, "users", uid, "backups", "main");
}

function getBridge() {
  return window.SongLeaderCloudBridge || null;
}

function renderAuthUI(user) {
  currentUser = user || null;
  if (!ui.signedOutBox || !ui.signedInBox) return;

  if (currentUser) {
    ui.signedOutBox.classList.add("hidden");
    ui.signedInBox.classList.remove("hidden");
    if (ui.accountLabel) {
      ui.accountLabel.textContent = `Signed in as ${currentUser.email || "Google account"}`;
    }
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
      setStatus(`Last synced: ${new Date(lastSync).toLocaleString()}`);
    } else {
      setStatus("Connected");
    }
  } else {
    ui.signedOutBox.classList.remove("hidden");
    ui.signedInBox.classList.add("hidden");
    setStatus("");
  }
}

async function pushToCloud(reason = "sync") {
  const bridge = getBridge();
  if (!currentUser || !bridge || isSyncing) return;

  isSyncing = true;
  if (reason === "manual") setStatus("Uploading to cloud…");

  try {
    const payload = bridge.getBackupPayload();
    const nowISO = new Date().toISOString();
    await setDoc(getDocRef(currentUser.uid), {
      updatedAt: nowISO,
      app: payload.app,
      version: payload.version,
      data: payload.data,
    });
    localStorage.setItem(LAST_SYNC_KEY, nowISO);
    setStatus(`Last synced: ${new Date(nowISO).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
  } catch (err) {
    console.error("Cloud upload failed:", err);
    setStatus(`Sync error: ${err.message}`);
  } finally {
    isSyncing = false;
  }
}

async function pullOrReconcileOnSignIn(user) {
  const bridge = getBridge();
  if (!user || !bridge || isSyncing) return;

  isSyncing = true;
  setStatus("Checking cloud backup…");

  try {
    const snap = await getDoc(getDocRef(user.uid));
    const localSnapshot = bridge.getBackupPayload();
    const hasLocalData = bridge.hasMeaningfulLocalData();

    if (!snap.exists()) {
      if (hasLocalData) {
        const nowISO = new Date().toISOString();
        await setDoc(getDocRef(user.uid), {
          updatedAt: nowISO,
          app: localSnapshot.app,
          version: localSnapshot.version,
          data: localSnapshot.data,
        });
        localStorage.setItem(LAST_SYNC_KEY, nowISO);
        setStatus("Uploaded local library to cloud.");
      } else {
        setStatus("Ready — no cloud backup found yet.");
      }
      return;
    }

    const cloudDoc = snap.data();
    const cloudUpdated = cloudDoc && cloudDoc.updatedAt ? new Date(cloudDoc.updatedAt).getTime() : 0;
    const lastLocalSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastLocalSync = lastLocalSyncStr ? new Date(lastLocalSyncStr).getTime() : 0;

    if (!hasLocalData || cloudUpdated > lastLocalSync) {
      bridge.applyBackupData(cloudDoc.data || {});
      const syncStamp = cloudDoc.updatedAt || new Date().toISOString();
      localStorage.setItem(LAST_SYNC_KEY, syncStamp);
      setStatus(`Restored from cloud (${new Date(syncStamp).toLocaleDateString()}).`);
    } else {
      const nowISO = new Date().toISOString();
      await setDoc(getDocRef(user.uid), {
        updatedAt: nowISO,
        app: localSnapshot.app,
        version: localSnapshot.version,
        data: localSnapshot.data,
      });
      localStorage.setItem(LAST_SYNC_KEY, nowISO);
      setStatus("Synced local changes to cloud.");
    }
  } catch (err) {
    console.error("Cloud reconcile failed:", err);
    setStatus(`Sync error: ${err.message}`);
  } finally {
    isSyncing = false;
  }
}

function scheduleDebouncedSync() {
  if (!currentUser) return;
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => {
    pushToCloud("auto");
  }, 4000);
}

// Expose bridge to app.js
window.SongLeaderCloud = {
  notifyDataChanged: scheduleDebouncedSync,
};

ui.signInBtn?.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    if (err.code === "auth/popup-blocked" || err.code === "auth/operation-not-supported-in-this-environment") {
      await signInWithRedirect(auth, provider);
    } else if (err.code !== "auth/popup-closed-by-user") {
      setStatus(`Sign-in error: ${err.message}`);
    }
  }
});

ui.syncNowBtn?.addEventListener("click", () => {
  pushToCloud("manual");
});

ui.signOutBtn?.addEventListener("click", async () => {
  if (syncTimer) clearTimeout(syncTimer);
  await signOut(auth);
});

ui.deleteBtn?.addEventListener("click", async () => {
  if (!currentUser) return;
  const ok = window.confirm("Permanently delete your cloud backup from Song Leader? Your local data on this device will stay intact.");
  if (!ok) return;
  try {
    await deleteDoc(getDocRef(currentUser.uid));
    localStorage.removeItem(LAST_SYNC_KEY);
    setStatus("Cloud backup deleted.");
  } catch (err) {
    setStatus(`Delete error: ${err.message}`);
  }
});

onAuthStateChanged(auth, async (user) => {
  renderAuthUI(user);
  if (user) {
    await pullOrReconcileOnSignIn(user);
  }
});