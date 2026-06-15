// The app works for everyone — your profile and conversations live in the
// browser (localStorage), so no login is required to use Nikos. Signing in is
// optional and only adds cross-device sync later. (We intentionally do NOT wrap
// this in AuthGate, which would bounce guests to /signin.)
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
