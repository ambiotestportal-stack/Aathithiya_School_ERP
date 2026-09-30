import { Request, Response } from 'express';
import VisitorModel from '../models/Visitor';

export const getVisitors = async (req: Request, res: Response): Promise<void> => {
  try {
    const visitors = await VisitorModel.find().sort({ createdAt: -1 }).lean();
    res.json(visitors);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching visitors' });
  }
};

export const createVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const newVisitor = new VisitorModel(req.body);
    await newVisitor.save();
    res.status(201).json(newVisitor);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while creating visitor', error: error.message });
  }
};

export const updateVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedVisitor = await VisitorModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedVisitor) {
      res.status(404).json({ message: 'Visitor not found' });
      return;
    }
    res.json(updatedVisitor);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while updating visitor', error: error.message });
  }
};

export const deleteVisitor = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedVisitor = await VisitorModel.findByIdAndDelete(req.params.id);
    if (!deletedVisitor) {
      res.status(404).json({ message: 'Visitor not found' });
      return;
    }
    res.json({ message: 'Visitor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting visitor' });
  }
};
