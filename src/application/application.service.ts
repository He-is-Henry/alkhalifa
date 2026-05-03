import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Application } from './application.schema';
import { Model } from 'mongoose';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(Application.name)
    private readonly applicationModel: Model<Application>,
  ) {}

  create(createApplicationDto: CreateApplicationDto) {
    return this.applicationModel.create(createApplicationDto);
  }

  findAll() {
    return this.applicationModel.find();
  }

  findOne(id: string) {
    return this.applicationModel.findById(id);
  }

  update(id: string, updateApplicationDto: UpdateApplicationDto) {
    const status = updateApplicationDto.status;
    console.log(`Updating ${id} to ${status}`);
    return this.applicationModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
  }

  remove(id: string) {
    return this.applicationModel.deleteOne({ _id: id });
  }
}
