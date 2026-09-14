import { Request, Response } from 'express';
import Batch from '../models/Batch';

export const getBatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const batches = await Batch.find().sort({ startDate: -1 }).lean();
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isDateRangeValid } from '../utils/validation';

export const createBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Batch name is required' });
      return;
    }

    if (!startDate || !endDate || !isDateRangeValid(startDate, endDate)) {
      res.status(400).json({ message: 'Batch start date must be before or equal to end date' });
      return;
    }

    const newBatch = new Batch({
      name: name.trim(),
      startDate,
      endDate
    });
    await newBatch.save();
    res.status(201).json(newBatch);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Batch name already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteBatch = async (req: Request, res: Response): Promise<void> => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
