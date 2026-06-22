import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { FaqService } from './faq.service';

class SearchDto {
  @IsString()
  @MinLength(1)
  query!: string;
}

@Controller('faqs')
export class FaqController {
  private readonly logger = new Logger(FaqController.name);

  constructor(private readonly faqService: FaqService) {}

  @Get()
  async findAll() {
    this.logger.log('GET /faqs');
    return this.faqService.findAll();
  }

  @Post('search')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async search(@Body() dto: SearchDto) {
    this.logger.log(`POST /faqs/search query="${dto.query}"`);
    return this.faqService.search(dto.query);
  }
}
