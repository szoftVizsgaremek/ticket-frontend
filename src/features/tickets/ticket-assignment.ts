import { ROLES, ROLE_LABELS, type Role } from "@/features/auth/auth.types";
import type { TicketType } from "./ticket.types";

// Who routes which ticket type, and to whom it must be handed.
//
//   thermal / hardware  ->  an operator hands it to an engineer
//   software            ->  a technician hands it to IT
//
// Mirrors TICKET_ASSIGNMENT_RULES in the backend (mariadb_backend/src/roles.js).
// The backend re-checks every one of these on create and on re-assignment, so
// this only narrows the dropdowns and explains the rules to the user.
export const TICKET_ASSIGNMENT_RULES: Record<
  TicketType,
  { assigneeRole: Role; assignerRoles: Role[] }
> = {
  thermal: {
    assigneeRole: ROLES.ENGINEER,
    assignerRoles: [ROLES.OPERATOR],
  },
  hardware: {
    assigneeRole: ROLES.ENGINEER,
    assignerRoles: [ROLES.OPERATOR],
  },
  software: {
    assigneeRole: ROLES.IT,
    assignerRoles: [ROLES.TECHNICIAN],
  },
};

function isRoutingAuthority(role: Role | undefined): boolean {
  return (
    role === ROLES.AREA_MANAGER ||
    role === ROLES.ADMIN ||
    role === ROLES.SUPERADMIN
  );
}

// Precomputed so these functions return a stable reference across renders and
// stay usable as effect/memo dependencies.
const ALL_TYPES: TicketType[] = ["thermal", "software", "hardware"];

const ROUTABLE_BY_ROLE: Record<Role, TicketType[]> = {
  [ROLES.SUPERADMIN]: ALL_TYPES,
  [ROLES.ADMIN]: ALL_TYPES,
  [ROLES.AREA_MANAGER]: ALL_TYPES,
  [ROLES.OPERATOR]: ["thermal", "hardware"],
  [ROLES.TECHNICIAN]: ["software"],
  [ROLES.ENGINEER]: [],
  [ROLES.IT]: [],
};

const ASSIGNEE_ROLE_BY_TYPE: Record<TicketType, Role[]> = {
  thermal: [ROLES.ENGINEER],
  hardware: [ROLES.ENGINEER],
  software: [ROLES.IT],
};

/** Ticket types this role is allowed to route. */
export function routableTypesFor(role: Role | undefined): TicketType[] {
  return role ? ROUTABLE_BY_ROLE[role] : [];
}

/** Users this role is allowed to put on a ticket of `type`. */
export function assignableRolesFor(
  type: TicketType,
  role: Role | undefined
): Role[] | "all" {
  if (isRoutingAuthority(role)) {
    return "all";
  }

  return ASSIGNEE_ROLE_BY_TYPE[type];
}

/** One-line explanation of who may route `type` and to whom. */
// export function routingHint(type: TicketType): string {
//   const rule = TICKET_ASSIGNMENT_RULES[type];
//   const assigners = rule.assignerRoles
//     .map((role) => ROLE_LABELS[role].toLowerCase())
//     .join(" or ");

//   return `Routed by an ${assigners} to an ${ROLE_LABELS[rule.assigneeRole].toLowerCase()}`;
// }
