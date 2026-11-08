import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkshopSessionDto } from './create-workshop-session.dto.js';

export class UpdateWorkshopSessionDto extends PartialType(CreateWorkshopSessionDto) {}
