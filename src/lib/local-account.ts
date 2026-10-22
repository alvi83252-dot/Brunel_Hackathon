const ACCOUNT_KEY = "btm-account";
const DRAFT_KEYS = {
  PARTICIPANT: "btm-register-draft",
  JUDGE: "btm-judge-register-draft",
} as const;

export type AccountRole = keyof typeof DRAFT_KEYS;

export type RememberedAccount = {
  name: string;
  email: string;
  studentId: string;
  role: AccountRole;
};

export type RegisterDraft = {
  name: string;
  studentId: string;
  email: string;
};

function readStored<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStored(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing can block storage. The account still exists on the server.
  }
}

function isDraft(value: RegisterDraft | null): value is RegisterDraft {
  return Boolean(value && typeof value.name === "string" && typeof value.studentId === "string" && typeof value.email === "string");
}

function isAccount(value: RememberedAccount | null): value is RememberedAccount {
  return Boolean(value && (value.role === "PARTICIPANT" || value.role === "JUDGE") && typeof value.email === "string" && value.email.includes("@"));
}

export function loadRegisterDraft(role: AccountRole): RegisterDraft | null {
  const draft = readStored<RegisterDraft>(DRAFT_KEYS[role]);
  return isDraft(draft) ? draft : null;
}

export function saveRegisterDraft(role: AccountRole, draft: RegisterDraft) {
  writeStored(DRAFT_KEYS[role], {
    name: draft.name,
    studentId: draft.studentId,
    email: draft.email,
  });
}

export function clearRegisterDraft(role: AccountRole) {
  try {
    localStorage.removeItem(DRAFT_KEYS[role]);
  } catch {
    // Ignore storage failures.
  }
}

export function loadRememberedAccount(): RememberedAccount | null {
  const account = readStored<RememberedAccount>(ACCOUNT_KEY);
  return isAccount(account) ? account : null;
}

export function rememberAccount(account: RememberedAccount) {
  const role: AccountRole = account.role === "JUDGE" ? "JUDGE" : "PARTICIPANT";
  writeStored(ACCOUNT_KEY, {
    name: account.name.trim(),
    email: account.email.trim().toLowerCase(),
    studentId: account.studentId.trim(),
    role,
  });
  clearRegisterDraft(role);
}
