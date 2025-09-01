import { BadRequestException, Controller, Delete, Get, Param, ParseIntPipe, Post, Req, Res, StreamableFile, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import LocalFilesInterceptor from 'src/interceptors/localFiles.interceptor';
import { UserService } from 'src/user/user.service';
import { UploadsService } from './uploads.service';
import { Response } from 'express';
import { createReadStream, unlink } from 'fs';
import { join } from 'path';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';
import { PrismaService } from 'src/prisma.service';

@Controller('uploads')
export class UploadsController {
    constructor(private userService: UserService, private uploadsService: UploadsService, private prisma: PrismaService){}
    @UseGuards(JwtAuthGuard)
    @Post("avatarUploads")
    @UseInterceptors(LocalFilesInterceptor({
        fieldName: 'file',
        path: '/avatars',
        fileFilter(req, file, callback) {
            if(!file.mimetype.includes('image')){
                return callback(new BadRequestException('Provide a valid image'),false)
            }
            callback(null,true)
        },
        limits:{
            fileSize:Math.pow(2048,2)// wielkość pliku 2MB
        }
    }))
    async uploadAvatar(@Req() req,@UploadedFile() file: Express.Multer.File)
    {
        const isProfilePicture = true;
        const userId = req.user.id;
        const UserAvatar = await this.uploadsService.getFileByRelatedIdAndIsProfilePicture(userId,isProfilePicture);
        if(UserAvatar)
        { 
            try{
                const dto = {avatar_id:null}
                await this.userService.update(UserAvatar.relatedId,dto)
                await this.uploadsService.DeleteById(UserAvatar.id)
                unlink(UserAvatar.path,(err => {
                    if (err) console.log(err);}))
            }catch{
                throw new BadRequestException('problem z usunięciem metadanych pliku') 
            }
            
        }
        let picture;
        try{
             picture = await this.uploadsService.saveFiles(file.filename,file.mimetype,file.path,userId,isProfilePicture)
             const dto = {avatar_id:picture.id}
             await this.userService.update(userId,dto)
        }catch{
            unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
              });
            throw new BadRequestException('problem z zapisem metadanych pliku') 
        }
        return {
            message: `File uploaded`,
            avatar_id: picture.id
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post("CollectionCoverUploads/:id")
    @UseInterceptors(LocalFilesInterceptor({
        fieldName: 'file',
        path: '/CollectionCover',
        fileFilter(req, file, callback) {
            if(!file.mimetype.includes('image')){
                return callback(new BadRequestException('Provide a valid image'),false)
            }
            callback(null,true)
        },
        limits:{
            fileSize:Math.pow(2048,2)// wielkość pliku 2MB
        }
    }))
    async uploadCollectionCover(@Param('id', ParseIntPipe) TaskCollectionId:number,@UploadedFile() file: Express.Multer.File)
    {
        const isProfilePicture = false;
        const CollectionCover = await this.uploadsService.getFileByRelatedIdAndIsProfilePicture(TaskCollectionId,isProfilePicture);
        if(CollectionCover)
        {
            try{
                const dto = {photo_id:null}
                await this.prisma.task_collection.update({
                   where:{
                     id: CollectionCover.relatedId
                   },
                   data: dto
                 }) 
                 await this.uploadsService.DeleteById(CollectionCover.id);
                 unlink(CollectionCover.path,(err => {
                    if (err) console.log(err);}))
            }catch{
                throw new BadRequestException('problem z usunięciem metadanych pliku') 
            }
        }
        try{
             const picture = await this.uploadsService.saveFiles(file.filename,file.mimetype,file.path,TaskCollectionId,isProfilePicture)
             const dto = {photo_id:picture.id}
             await this.prisma.task_collection.update({
                where:{
                  id: TaskCollectionId
                },
                data: dto
              }) 
        }catch{
            unlink(file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
              });
            throw new BadRequestException('problem z zapisem metadanych pliku') 
        }
        return {
            message: 'File uploaded',
        }
    }

    @Get(':id')
    async getDatabaseFileById(@Param('id', ParseIntPipe) id:number, @Res({ passthrough:true}) response: Response){
        const file = await this.uploadsService.getFileById(id)
        
        const stream = createReadStream(join(process.cwd(),file.path))

        response.set({
            'Content-Disposition': `inline; filename="${file.file_name}"`,
            'Content-Type': file.mimetype
          })
        return new StreamableFile(stream)
     }
     
     @UseGuards(JwtAuthGuard)
     @Delete(':id')
    async deleteDatabaseFileById(@Param('id', ParseIntPipe) id:number, @Res({ passthrough:true}) response: Response){
        const filePicture = await this.uploadsService.getFileById(id);
        if(filePicture.isProfilePicture)
        {
            try{
            const dto = {avatar_id:null}
            await this.userService.update(filePicture.relatedId,dto)
        }catch{
            throw new BadRequestException('problem z usunięciem metadanych pliku') 
        }
        }else{
            try{
                const dto = {photo_id:null}
                await this.prisma.task_collection.update({
                   where:{
                     id: filePicture.relatedId
                   },
                   data: dto
                 })
            }catch{
                throw new BadRequestException('problem z usunięciem metadanych pliku') 
            }
        }
        await this.uploadsService.DeleteById(filePicture.id)
        unlink(filePicture.path,(err => {
            if (err) console.log(err);}))
        return {message:'poprawne usunięcie pliku'}
     }
}
