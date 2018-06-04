import { CanActivate, ExecutionContext, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "./role";
import { UserEntity } from "../entity/user/user.entity";
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * A guard which combines the JWT passport auth method with restrictions based on
 * the authenticated user's roles.
 *
 * @example
 * ```
 *  @RolesGuard([Role.Superadmin])
 *  @Query('administrators')
 *  getAdministrators() {
 *      // ...
 *  }
 * ```
 */
export function RolesGuard(roles: Role[]) {
    return UseGuards(AuthGuard('jwt'), forRoles(roles));
}

/**
 * A guard which specifies which roles are authorized to access a given
 * route or property in a Controller / Resolver.
 */
function forRoles(roles: Role[]) {
    return {
        canActivate(context: ExecutionContext) {
            const user: UserEntity = context.switchToHttp().getRequest().user;
            if (!user) {
                return false;
            }
            return arraysIntersect(roles, user.roles);
        }
    } as CanActivate;
}

/**
 * Returns true if any element of arr1 appears in arr2.
 */
function arraysIntersect(arr1, arr2): boolean {
    return arr1.reduce((intersects, role) => {
        return intersects || arr2.includes(role);
    }, false);
}
