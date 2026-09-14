import { Request, Response } from 'express';
import RoleModel from '../models/Role';

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = await RoleModel.find().sort({ createdAt: -1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body;
    const role = new RoleModel({ name, permissions });
    await role.save();
    res.status(201).json(role);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const { name, permissions } = req.body;
    const role = await RoleModel.findByIdAndUpdate(req.params.id, { name, permissions }, { new: true });
    res.json(role);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    await RoleModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
