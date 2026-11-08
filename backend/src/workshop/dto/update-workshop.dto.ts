import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopDto } from './create-workshop.dto.js';

export class UpdateWorkshopDto extends PartialType(CreateWorkshopDto) {}
