import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { ClassModel, ClassSchema } from '../class/class.schema';
import { Subject, SubjectSchema } from '../subject/subject.schema';
import { User, UserSchema } from '../user/user.schema';
import { Note, NoteSchema } from '../note/note.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ClassModel.name, schema: ClassSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: User.name, schema: UserSchema },
      { name: Note.name, schema: NoteSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
