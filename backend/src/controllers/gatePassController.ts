import { Request, Response } from 'express';
import GatePassModel from '../models/GatePass';

export const getGatePasses = async (req: Request, res: Response): Promise<void> => {
  try {
    const passes = await GatePassModel.find().sort({ createdAt: -1 }).lean();
    res.json(passes);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching gate passes' });
  }
};

export const createGatePass = async (req: Request, res: Response): Promise<void> => {
  try {
    const newPass = new GatePassModel(req.body);
    await newPass.save();
    res.status(201).json(newPass);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while creating gate pass', error: error.message });
  }
};

export const updateGatePass = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedPass = await GatePassModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPass) {
      res.status(404).json({ message: 'Gate pass not found' });
      return;
    }
    res.json(updatedPass);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while updating gate pass', error: error.message });
  }
};

export const deleteGatePass = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedPass = await GatePassModel.findByIdAndDelete(req.params.id);
    if (!deletedPass) {
      res.status(404).json({ message: 'Gate pass not found' });
      return;
    }
    res.json({ message: 'Gate pass deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting gate pass' });
  }
};
