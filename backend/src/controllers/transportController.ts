import { Request, Response } from 'express';
import TransportModel from '../models/Transport';

export const getVehicles = async (req: Request, res: Response): Promise<void> => {
  try {
    const vehicles = await TransportModel.find().populate({
      path: 'students',
      populate: { path: 'user enrolledClass', select: 'name section' }
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isValidPhone, isPositiveNumber } from '../utils/validation';

export const createVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { vehicleNumber, route, driverContact, capacity, busNumber, driverName } = req.body;

    if (!vehicleNumber || typeof vehicleNumber !== 'string' || !vehicleNumber.trim()) {
      res.status(400).json({ message: 'Vehicle number is required' });
      return;
    }

    if (!route || typeof route !== 'string' || !route.trim()) {
      res.status(400).json({ message: 'Route description is required' });
      return;
    }

    if (!isPositiveNumber(capacity)) {
      res.status(400).json({ message: 'Vehicle capacity must be at least 1' });
      return;
    }

    if (driverContact && !isValidPhone(driverContact)) {
      res.status(400).json({ message: 'Please provide a valid driver contact phone number (7-15 digits)' });
      return;
    }

    const newVehicle = new TransportModel({
      busNumber: busNumber ? busNumber.trim() : undefined,
      vehicleNumber: vehicleNumber.trim(),
      driverName: driverName ? driverName.trim() : 'Driver',
      driverContact: driverContact ? driverContact.trim() : '',
      route: route.trim(),
      capacity: Number(capacity)
    });
    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Vehicle number already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteVehicle = async (req: Request, res: Response): Promise<void> => {
  try {
    await TransportModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const allocateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    
    const updatedVehicle = await TransportModel.findOneAndUpdate(
      { 
        _id: id,
        students: { $ne: studentId },
        $expr: { $lt: [{ $size: '$students' }, '$capacity'] }
      },
      { 
        $addToSet: { students: studentId }
      },
      { new: true }
    );

    if (!updatedVehicle) {
      const vehicle = await TransportModel.findById(id);
      if (!vehicle) {
        res.status(404).json({ message: 'Vehicle not found' });
        return;
      }
      if (vehicle.students.includes(studentId as any)) {
        res.status(400).json({ message: 'Student is already allocated to this vehicle' });
        return;
      }
      res.status(400).json({ message: 'Vehicle is at full capacity' });
      return;
    }
    
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, studentId } = req.params;
    
    const updatedVehicle = await TransportModel.findByIdAndUpdate(
      id,
      { $pull: { students: studentId } },
      { new: true }
    );

    if (!updatedVehicle) {
      res.status(404).json({ message: 'Vehicle not found' });
      return;
    }
    
    res.json(updatedVehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
