import { Role } from './roles.enum';

export class RoleFactory {
  static createRole(role: string): Role {
    if (role === 'admin') {
      return Role.Admin;
    }
    return Role.User;
  }
}
