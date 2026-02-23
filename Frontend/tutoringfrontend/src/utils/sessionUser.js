export function getSessionUser() {
  try {
    return JSON.parse(sessionStorage.getItem("myUser") || "null");
  } catch {
    return null;
  }
}
