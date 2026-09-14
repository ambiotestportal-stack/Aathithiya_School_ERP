import { Request, Response } from 'express';
import LibraryBookModel from '../models/LibraryBook';

export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await LibraryBookModel.find().sort({ createdAt: -1 }).lean();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import { isPositiveNumber } from '../utils/validation';

export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, author, isbn, category, totalCopies } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ message: 'Book title is required' });
      return;
    }

    if (!author || typeof author !== 'string' || !author.trim()) {
      res.status(400).json({ message: 'Author name is required' });
      return;
    }

    if (!isbn || typeof isbn !== 'string' || !isbn.trim()) {
      res.status(400).json({ message: 'ISBN number is required' });
      return;
    }

    if (!isPositiveNumber(totalCopies)) {
      res.status(400).json({ message: 'Total copies must be at least 1' });
      return;
    }

    const numCopies = Number(totalCopies);
    const newBook = new LibraryBookModel({
      title: title.trim(),
      author: author.trim(),
      isbn: isbn.trim(),
      category: category ? category.trim() : 'General',
      totalCopies: numCopies,
      availableCopies: numCopies
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'A book with this ISBN already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteBook = async (req: Request, res: Response): Promise<void> => {
  try {
    await LibraryBookModel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

import LibraryIssueModel from '../models/LibraryIssue';

export const getIssuedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { studentId } = req.query;
    let query: any = {};
    if (studentId) query.student = studentId;
    
    const issues = await LibraryIssueModel.find(query).populate("book", "title author isbn").populate("student", "name rollNumber").sort({ issueDate: -1 }).lean();
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const issueBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    
    const book = await LibraryBookModel.findById(bookId);
    if (!book || book.availableCopies <= 0) {
      res.status(400).json({ message: 'Book not available for issuing' });
      return;
    }
    
    const newIssue = new LibraryIssueModel({
      book: bookId,
      student: studentId,
      dueDate
    });
    
    await newIssue.save();
    
    await LibraryBookModel.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    
    res.status(201).json(newIssue);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const returnBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { issueId } = req.params;
    
    const issue = await LibraryIssueModel.findById(issueId);
    if (!issue || issue.status === 'Returned') {
      res.status(400).json({ message: 'Invalid issue record' });
      return;
    }
    
    issue.status = 'Returned';
    issue.returnDate = new Date();
    await issue.save();
    
    await LibraryBookModel.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });
    
    res.json({ message: 'Book returned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
