import * as authService from '../../services/auth.service.js';
import { query } from '../../config/db.js';
import { success } from '../../utils/helpers.js';

export async function login(req, res) {
  const result = await authService.login(req.body.email, req.body.password);
  return success(res, result, 'Login successful');
}

export async function register(req, res) {
  const result = await authService.register(req.body);
  return success(res, result, 'Registration successful', 201);
}

export async function forgotPassword(req, res) {
  const result = await authService.forgotPassword(req.body.email);
  return success(res, result);
}

export async function getMe(req, res) {
  return success(res, { user: req.user });
}

export async function getRoles(req, res) {
  const roles = await query('SELECT role_id, role_name, description FROM roles ORDER BY role_name');
  return success(res, roles);
}

export async function listUsers(req, res) {
  const users = await authService.listUsers();
  return success(res, { users });
}

export async function createUser(req, res) {
  const result = await authService.createUserByAdmin(req.body);
  return success(res, result, 'User account created', 201);
}
