import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { TaskCollectionModule } from './task_collection/task_collection.module';
import { TaskOpenModule } from './task_open/task_open.module';
import { TaskTestModule } from './task_test/task_test.module';
import { TestOptionModule } from './test_option/test_option.module';
import { CardModule } from './card/card.module';
import { TaskMatchModule } from './task_match/task_match.module';
import { MatchOptionModule } from './match_option/match_option.module';
import { TaskGapModule } from './task_gap/task_gap.module';
import { GapOptionModule } from './gap_option/gap_option.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { CollectionTypeModule } from './collection_type/collection_type.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { EvaluationValueModule } from './evaluation_value/evaluation_value.module';
import { AuthService } from './auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification/notification.service';
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { NotificationModule } from './notification/notification.module';
import { AnswerModule } from './answer/answer.module';
import { CollectionComplaintModule } from './collection_complaint/collection_complaint.module';
import { UserComplaintModule } from './user_complaint/user_complaint.module';
import { CommentComplaintModule } from './comment_complaint/comment_complaint.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { UserActivityInterceptor } from './interceptors/user-activity.interceptor';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    DatabaseModule,
    UserModule,
    AuthModule,
    TaskCollectionModule, 
    TaskOpenModule, 
    TaskTestModule, 
    TestOptionModule, 
    CardModule, 
    TaskMatchModule, 
    MatchOptionModule, 
    TaskGapModule, 
    GapOptionModule, 
    CollectionTypeModule, 
    SubscriptionModule, 
    EvaluationModule, 
    EvaluationValueModule,
    NotificationModule,
    AnswerModule,
    CollectionComplaintModule,
    UserComplaintModule,
    CommentComplaintModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, AuthService, JwtService, NotificationService, {
    provide: APP_INTERCEPTOR,
    useClass: UserActivityInterceptor,
  },],
})
export class AppModule {}
