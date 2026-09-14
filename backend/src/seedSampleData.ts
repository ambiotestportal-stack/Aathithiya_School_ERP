import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User, { UserRole } from './models/User';
import StaffProfile from './models/StaffProfile';
import StudentProfile from './models/StudentProfile';
import Subject from './models/Subject';
import Batch from './models/Batch';
import Class from './models/Class';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/school_erp';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // 0. Seed Super Admin
    let adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        password: 'admin123',
        role: UserRole.SUPER_ADMIN,
        name: 'Super Admin'
      });
      await adminUser.save();
      console.log('Created Super Admin user (admin / admin123)');
    } else {
      adminUser.password = 'admin123';
      adminUser.role = UserRole.SUPER_ADMIN;
      await adminUser.save();
      console.log('Updated Super Admin password to admin123');
    }

    // 1. Seed Batch
    let batch = await Batch.findOne({ name: 'Batch 2026' });
    if (!batch) {
      batch = await Batch.create({
        name: 'Batch 2026',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2027-04-30'),
        isActive: true
      });
      console.log('Created Batch: Batch 2026');
    }

    // 2. Seed Subjects
    const sampleSubjects: { name: string; code: string; type: 'Theory' | 'Practical' }[] = [
      { name: 'Tamil', code: 'TAM101', type: 'Theory' },
      { name: 'English', code: 'ENG101', type: 'Theory' },
      { name: 'Mathematics', code: 'MAT101', type: 'Theory' },
      { name: 'Science', code: 'SCI101', type: 'Practical' },
      { name: 'Social Studies', code: 'SOC101', type: 'Theory' }
    ];

    for (const sub of sampleSubjects) {
      const exists = await Subject.findOne({ code: sub.code });
      if (!exists) {
        await Subject.create(sub);
        console.log(`Created Subject: ${sub.name} (${sub.code})`);
      }
    }

    // 3. Seed Staff (Teachers)
    const sampleStaff = [
      {
        name: 'Ramesh Kumar',
        email: 'ramesh@school.com',
        username: 'ramesh@school.com',
        employeeId: 'EMP001',
        department: 'Tamil',
        designation: 'Senior Teacher',
        joiningDate: new Date('2020-01-15'),
        qualification: 'M.A., B.Ed',
        experienceYears: 6,
        salary: 35000,
        phone: '9876543210',
        address: '12, West Street, Chennai'
      },
      {
        name: 'Priya Sharma',
        email: 'priya@school.com',
        username: 'priya@school.com',
        employeeId: 'EMP002',
        department: 'Mathematics',
        designation: 'Assistant Teacher',
        joiningDate: new Date('2022-06-01'),
        qualification: 'M.Sc., B.Ed',
        experienceYears: 3,
        salary: 30000,
        phone: '9876543211',
        address: '45, Anna Nagar, Chennai'
      }
    ];

    let teacherUser1: any = null;

    for (const staff of sampleStaff) {
      let user = await User.findOne({ username: staff.username });
      if (!user) {
        user = new User({
          name: staff.name,
          email: staff.email,
          username: staff.username,
          password: staff.employeeId, // Initial password: Employee ID
          role: UserRole.TEACHER
        });
        await user.save();
        console.log(`Created Teacher User: ${staff.name} (Password: ${staff.employeeId})`);
      }

      if (staff.employeeId === 'EMP001') teacherUser1 = user;

      const profileExists = await StaffProfile.findOne({ employeeId: staff.employeeId });
      if (!profileExists) {
        await StaffProfile.create({
          user: user._id,
          employeeId: staff.employeeId,
          department: staff.department,
          designation: staff.designation,
          joiningDate: staff.joiningDate,
          qualification: staff.qualification,
          experienceYears: staff.experienceYears,
          salary: staff.salary,
          phone: staff.phone,
          address: staff.address
        });
        console.log(`Created Staff Profile: ${staff.name} (${staff.employeeId})`);
      }
    }

    // 4. Seed Class
    let class10A = await Class.findOne({ name: 'Grade 10', section: 'A' });
    if (!class10A) {
      class10A = await Class.create({
        name: 'Grade 10',
        section: 'A',
        capacity: 35,
        batch: batch._id,
        classTeacher: teacherUser1 ? teacherUser1._id : null
      });
      console.log('Created Class: Grade 10 - Sec A');
    }

    // 5. Seed Parent User
    let parentUser = await User.findOne({ username: 'parent_murugan' });
    if (!parentUser) {
      parentUser = new User({
        name: 'Murugan V',
        username: 'parent_murugan',
        password: 'parent123',
        role: UserRole.PARENT
      });
      await parentUser.save();
      console.log('Created Parent User: Murugan V');
    }

    // 6. Seed Students
    const sampleStudents: {
      name: string;
      rollNumber: string;
      dob: string;
      gender: 'Male' | 'Female' | 'Other';
      bloodGroup: string;
      fatherName: string;
      motherName: string;
      fatherOccupation: string;
      motherOccupation: string;
      contactNumber: string;
      annualIncome: number;
      address: string;
    }[] = [
      {
        name: 'Karthik Murugan',
        rollNumber: '1001',
        dob: '2010-05-14',
        gender: 'Male',
        bloodGroup: 'O+',
        fatherName: 'Murugan V',
        motherName: 'Lakshmi M',
        fatherOccupation: 'Engineer',
        motherOccupation: 'Homemaker',
        contactNumber: '9840123456',
        annualIncome: 600000,
        address: '78, MGR Street, Chennai'
      },
      {
        name: 'Ananya Ramesh',
        rollNumber: '1002',
        dob: '2010-08-22',
        gender: 'Female',
        bloodGroup: 'A+',
        fatherName: 'Ramesh K',
        motherName: 'Saritha R',
        fatherOccupation: 'Business',
        motherOccupation: 'Teacher',
        contactNumber: '9840654321',
        annualIncome: 800000,
        address: '23, Gandhi Road, Chennai'
      }
    ];

    for (const stud of sampleStudents) {
      const existingProfile = await StudentProfile.findOne({ rollNumber: stud.rollNumber });
      if (!existingProfile) {
        // Create student user account (ID: rollNo, Password: dob)
        let studentUser = new User({
          name: stud.name,
          username: stud.rollNumber,
          password: stud.dob,
          role: UserRole.STUDENT
        });
        await studentUser.save();

        await StudentProfile.create({
          user: studentUser._id,
          admissionNumber: `ADM-${stud.rollNumber}`,
          rollNumber: stud.rollNumber,
          enrolledClass: class10A._id,
          dob: new Date(stud.dob),
          gender: stud.gender,
          bloodGroup: stud.bloodGroup,
          parent: parentUser._id,
          fatherName: stud.fatherName,
          motherName: stud.motherName,
          fatherOccupation: stud.fatherOccupation,
          motherOccupation: stud.motherOccupation,
          contactNumber: stud.contactNumber,
          annualIncome: stud.annualIncome,
          address: stud.address
        });
        console.log(`Created Student: ${stud.name} (Roll: ${stud.rollNumber}, Password: ${stud.dob})`);
      }
    }

    console.log('\n--- Seeding Completed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sample data:', error);
    process.exit(1);
  }
}

seedData();
