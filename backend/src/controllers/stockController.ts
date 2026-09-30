import { Request, Response } from 'express';
import StockModel from '../models/Stock';

export const getStocks = async (req: Request, res: Response): Promise<void> => {
  try {
    const stocks = await StockModel.find().sort({ createdAt: -1 }).lean();
    res.json(stocks);
  } catch (error) {
    res.status(500).json({ message: 'Server error while fetching stocks' });
  }
};

export const createStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const newStock = new StockModel(req.body);
    await newStock.save();
    res.status(201).json(newStock);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while creating stock', error: error.message });
  }
};

export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const updatedStock = await StockModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    res.json(updatedStock);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error while updating stock', error: error.message });
  }
};

export const deleteStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const deletedStock = await StockModel.findByIdAndDelete(req.params.id);
    if (!deletedStock) {
      res.status(404).json({ message: 'Stock item not found' });
      return;
    }
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting stock' });
  }
};
