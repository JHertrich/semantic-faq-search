import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { FaqController } from './faq.controller';
import { FaqService } from './faq.service';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ES_URL || 'http://localhost:9200',
    }),
  ],
  controllers: [FaqController],
  providers: [FaqService],
})
export class FaqModule {}
