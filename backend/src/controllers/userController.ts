import { Request, Response } from 'express';
import User from '../models/User';

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find().populate('customRole').select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

import { isValidEmail, isValidUsername } from '../utils/validation';
import { UserRole } from '../models/User';

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    let { username, password, role, name, email, customRole } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ message: 'Full name must be at least 2 characters long' });
      return;
    }

    const finalUsername = (username || email || '').trim();
    if (!finalUsername) {
      res.status(400).json({ message: 'Email or Username is required' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    const assignedRole = role || (customRole ? UserRole.SUB_ADMIN : UserRole.SUPER_ADMIN);
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(assignedRole)) {
      res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
      return;
    }

    const orConditions: any[] = [{ username: finalUsername }];
    if (email) orConditions.push({ email: email.trim().toLowerCase() });

    const existingUser = await User.findOne({ $or: orConditions });
    if (existingUser) {
      res.status(400).json({ message: 'User with this email or username already exists' });
      return;
    }

    const user = new User({
      username: finalUsername,
      password,
      role: assignedRole,
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : undefined,
      customRole: assignedRole === UserRole.SUB_ADMIN ? customRole : undefined
    });

    await user.save();
    
    // Return user without password
    const userResponse = await User.findById(user._id).populate('customRole').select('-password');
    res.status(201).json(userResponse);
  } catch (error: any) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, role, name, email } = req.body;

    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      res.status(400).json({ message: 'Full name must be at least 2 characters long' });
      return;
    }

    if (username && !isValidUsername(username)) {
      res.status(400).json({ message: 'Username must be 3-30 alphanumeric characters (._- allowed)' });
      return;
    }

    if (password && (typeof password !== 'string' || password.length < 6)) {
      res.status(400).json({ message: 'Password must be at least 6 characters long' });
      return;
    }

    if (email && !isValidEmail(email)) {
      res.status(400).json({ message: 'Please provide a valid email address' });
      return;
    }

    if (role) {
      const validRoles = Object.values(UserRole);
      if (!validRoles.includes(role)) {
        res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
        return;
      }
    }

    if (username) {
      const existingUser = await User.findOne({ username: username.trim(), _id: { $ne: id } });
      if (existingUser) {
        res.status(400).json({ message: 'Username already exists' });
        return;
      }
    }

    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (username) user.username = username.trim();
    if (role) {
      user.role = role;
      if (role === 'SUB_ADMIN' && req.body.customRole) {
        user.customRole = req.body.customRole;
      }
    }
    if (name) user.name = name.trim();
    if (email !== undefined) user.email = email ? email.trim() : undefined;
    if (password) user.password = password;

    await user.save();
    
    const userResponse = await User.findById(id).populate('customRole').select('-password');
    res.json(userResponse);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Prevent deleting the last super admin
    const userToDelete = await User.findById(id);
    if (userToDelete?.role === 'SUPER_ADMIN') {
      const adminCount = await User.countDocuments({ role: 'SUPER_ADMIN' } as any);
      if (adminCount <= 1) {
        res.status(400).json({ message: 'Cannot delete the only Super Admin' });
        return;
      }
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
