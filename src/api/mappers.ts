import { ApiUser } from "@/api/auth";
import { User } from "@/types";

export function mapApiUserToUser(apiUser: ApiUser): User {
  const firstName =
    typeof apiUser.first_name === "string" ? apiUser.first_name : "";
  const lastName =
    typeof apiUser.last_name === "string" ? apiUser.last_name : "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const email = typeof apiUser.email === "string" ? apiUser.email : "";
  const phone = typeof apiUser.phone === "string" ? apiUser.phone : "";
  const address = typeof apiUser.address === "string" ? apiUser.address : "";
  const district = typeof apiUser.district === "string" ? apiUser.district : "";
  const division = typeof apiUser.division === "string" ? apiUser.division : "Dhaka";

  const genderRaw = typeof apiUser.gender === "string" ? apiUser.gender : "";
  const gender =
    genderRaw === "M"
      ? ("male" as const)
      : genderRaw === "F"
        ? ("female" as const)
        : genderRaw.toLowerCase() as User["gender"] || "other";

  const hidePersonalInfo =
    typeof apiUser.hide_personal_info === "boolean"
      ? apiUser.hide_personal_info
      : false;

  const apiBloodGroup =
    typeof apiUser.blood_group === "string"
      ? apiUser.blood_group
      : undefined;

  const roleRaw = typeof apiUser.role === "string" ? apiUser.role : "";
  const roleName =
    roleRaw ||
    (typeof apiUser.id_role === "number" && apiUser.id_role === 1
      ? "ADMIN"
      : "USERROLE");

  const id =
    typeof apiUser.id === "number"
      ? String(apiUser.id)
      : typeof apiUser.id === "string"
        ? apiUser.id
        : email || `user_${Date.now()}`;

  const backendRole = roleName.toUpperCase();
  const normalizedRole: User["role"] =
    backendRole === "ADMIN" || backendRole === "SUPERADMIN" || backendRole === "MANAGER"
      ? backendRole
      : "USERROLE";

  return {
    ...apiUser,
    id,
    name: fullName || email || "User",
    email,
    phone,
    gender,
    address,
    district,
    division: division as User["division"],
    upazila: typeof apiUser.upazila === "string" ? apiUser.upazila : undefined,
    photo: typeof apiUser.photo === "string" && apiUser.photo ? apiUser.photo : undefined,
    bloodGroup: (apiBloodGroup as User["bloodGroup"]) || "O+",
    age: typeof apiUser.age === "number" ? apiUser.age : 0,
    occupation: typeof apiUser.profession === "string" ? apiUser.profession : "",
    lastDonationDate:
      typeof apiUser.donated_at === "string" ? apiUser.donated_at : undefined,
    hidePersonalInfo,
    createdAt: typeof apiUser.created_at === "string" ? apiUser.created_at : "",
    role: normalizedRole,
    isVerified: apiUser.is_verified === true,
  };
}
