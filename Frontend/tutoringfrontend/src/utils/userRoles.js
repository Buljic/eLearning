const ROLE_STUDENT = "STUDENT";
const ROLE_PROFESSOR = "PROFESOR";
const ROLE_ADMIN = "ADMIN";
const ROLE_BOTH = "OBOJE";

function addNormalizedRole(target, role) {
  if (!role || typeof role !== "string") {
    return;
  }

  if (role === ROLE_BOTH) {
    target.add(ROLE_STUDENT);
    target.add(ROLE_PROFESSOR);
    return;
  }

  target.add(role);
}

export function resolveUserRoles(user) {
  const normalized = new Set();
  if (!user || typeof user !== "object") {
    return normalized;
  }

  if (Array.isArray(user.roles)) {
    user.roles.forEach((role) => addNormalizedRole(normalized, role));
  }

  addNormalizedRole(normalized, user.accountType);
  return normalized;
}

export function hasRole(user, role) {
  if (!role) {
    return false;
  }
  return resolveUserRoles(user).has(role);
}

export function canActAsProfessor(user) {
  return hasRole(user, ROLE_PROFESSOR) || hasRole(user, ROLE_ADMIN);
}

export function canActAsStudent(user) {
  return hasRole(user, ROLE_STUDENT);
}
