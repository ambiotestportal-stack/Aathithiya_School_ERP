import { Request, Response } from 'express';
import CircularModel from '../models/Circular';

export const getCirculars = async (req: Request, res: Response): Promise<void> => {
  try {
    const circulars = await CircularModel.find().sort({ createdAt: -1 }).lean();
    res.json(circulars);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching circulars' });
  }
};

export const createCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    const newCircular = new CircularModel(req.body);
    await newCircular.save();
    res.status(201).json(newCircular);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while creating circular', error: error.message });
  }
};

export const updateCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedCircular = await CircularModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCircular) {
      res.status(404).json({ message: 'Circular not found' });
      return;
    }
    res.json(updatedCircular);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while updating circular', error: error.message });
  }
};

export const deleteCircular = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedCircular = await CircularModel.findByIdAndDelete(req.params.id);
    if (!deletedCircular) {
      res.status(404).json({ message: 'Circular not found' });
      return;
    }
    res.json({ message: 'Circular deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting circular' });
  }
};
