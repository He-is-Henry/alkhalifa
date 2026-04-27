import { OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';

import { ClassModel, ClassDocument } from '../class/class.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { User, UserDocument, UserRole } from '../user/user.schema';
import { Note, NoteDocument } from '../note/note.schema';

interface SyllabusWeek {
  week: number;
  topic: string;
  objectives: string[];
  content?: string;
}

interface SyllabusTerm {
  term: number;
  weeks: SyllabusWeek[];
}

interface SyllabusSubject {
  id: string;
  label: string;
  color: string;
  icon: string;
  terms?: SyllabusTerm[]; // important: optional
}

interface SyllabusClass {
  id: string;
  label: string;
  level: string;
  subjects: SyllabusSubject[];
}

interface Syllabus {
  meta: {
    curriculum: string;
    version: string;
    source: string;
  };
  classes: SyllabusClass[];
}
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(ClassModel.name)
    private readonly classModel: Model<ClassDocument>,

    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Note.name)
    private readonly noteModel: Model<NoteDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedClasses();
    await this.seedNotes();
    await this.seedAdmin();
  }

  private async seedClasses() {
    // Load syllabus JSON
    const syllabusPath = path.join(__dirname, '../../data/syllabus.json');
    const raw = fs.readFileSync(syllabusPath, 'utf-8');
    const syllabus = JSON.parse(raw) as Syllabus;

    for (const cls of syllabus.classes) {
      const createdClass = await this.classModel.findOneAndUpdate(
        { name: cls.label },
        {
          name: cls.label,
          level: cls.level,
          order: parseInt(cls.id.replace('basic', '')),
        },
        { upsert: true, new: true },
      );

      for (const s of cls.subjects) {
        await this.subjectModel.updateOne(
          {
            name: s.label,
            classId: createdClass._id,
          },
          {
            name: s.label,
            color: s.color,
            icon: s.icon,
            classId: createdClass._id,
          },
          { upsert: true },
        );
      }

      this.logger.log(
        `Seeded ${cls.label} with ${cls.subjects.length} subjects`,
      );
    }

    this.logger.log('Class + Subject seeding complete');
  }

  private async seedAdmin() {
    const adminExists = await this.userModel.findOne({
      role: UserRole.ADMIN,
    });

    if (adminExists) {
      this.logger.log('Admin already exists — skipping');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await this.userModel.create({
      name: 'Admin',
      email: 'admin@school.com',
      password: hashedPassword,
      role: UserRole.ADMIN,
      isActive: true,
    });

    this.logger.log(
      'Admin user seeded — email: admin@school.com / password: admin123',
    );
    this.logger.warn('Change admin password immediately after first login!');
  }

  private async seedNotes() {
    const syllabusPath = path.join(__dirname, '../../data/syllabus.json');
    const raw = fs.readFileSync(syllabusPath, 'utf-8');
    const syllabus = JSON.parse(raw) as Syllabus;

    for (const cls of syllabus.classes) {
      const dbClass = await this.classModel.findOne({ name: cls.label });
      if (!dbClass) {
        this.logger.warn(`Class not found: ${cls.label}`);
        continue;
      }
      for (const subj of cls.subjects) {
        const dbSubject = await this.subjectModel.findOne({
          name: subj.label,
          classId: dbClass._id,
        });

        if (!dbSubject) {
          this.logger.warn(`Subject not found: ${subj.label} in ${cls.label}`);
          continue;
        }
        if (!subj.terms) continue;

        for (const termObj of subj.terms) {
          const term = termObj.term;

          for (const wk of termObj.weeks) {
            const exists = await this.noteModel.findOne({
              classId: dbClass._id,
              subjectId: dbSubject._id,
              term,
              weekNum: wk.week,
            });

            if (exists) continue;

            const content = `
            <div style="padding:12px;background:#f9fafb;border-radius:8px;">
              <h3 style="color:#888;">Content not available yet</h3>
              <p>This lesson note will be uploaded soon.</p>
            </div>
          `;

            await this.noteModel.create({
              classId: dbClass._id,
              subjectId: dbSubject._id,
              term,
              weekNum: wk.week,
              title: wk.topic,
              objectives: wk.objectives || [],
              content,
              summary: '',
            });
          }
        }

        this.logger.log(`Seeded notes for ${subj.label} (${cls.label})`);
      }
    }

    this.logger.log('Notes seeding complete');
  }
}
