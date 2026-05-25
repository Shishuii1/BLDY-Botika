const LEGACY_ROLE_MAP = {
  admin: 'super_admin',
};

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const effectiveRole = LEGACY_ROLE_MAP[req.user.role_name] || req.user.role_name;
    if (!roles.includes(effectiveRole)) {
      return res.status(403).json({ success: false, message: 'Access denied for your role' });
    }
    next();
  };
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  PHARMACIST: 'pharmacist',
  CASHIER: 'cashier',
  INVENTORY: 'inventory_staff',
};
