import prisma from './config/database';
import bcrypt from 'bcryptjs';
import { UserRole } from './types';

async function seed() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nexusx.com' },
    update: {},
    create: {
      email: 'admin@nexusx.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'NexusX',
      role: UserRole.ADMIN,
      credits: 10000,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@nexusx.com' },
    update: {},
    create: {
      email: 'teacher@nexusx.com',
      password: teacherPassword,
      firstName: 'María',
      lastName: 'García',
      role: UserRole.TEACHER,
      subject: 'Matemáticas',
      grade: '5to',
      institution: 'Colegio San José',
      credits: 500,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@nexusx.com' },
    update: {},
    create: {
      email: 'student@nexusx.com',
      password: studentPassword,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: UserRole.STUDENT,
      grade: '5to',
      institution: 'Colegio San José',
      credits: 500,
    },
  });

  console.log('✅ Seed completed!');
  console.log('\n📝 Test users created:');
  console.log('Admin: admin@nexusx.com / admin123');
  console.log('Teacher: teacher@nexusx.com / teacher123');
  console.log('Student: student@nexusx.com / student123');

  await prisma.$disconnect();
}

seed()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
