import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UploadsService {

    constructor(  private prisma: PrismaService){}
    
    async saveFiles(fileName,mimeType,filePath,relatedId,isProfilePicture)
    {
        return await this.prisma.upload_picture.create({
            data: {
                relatedId: relatedId,
                file_name: fileName,
                path: filePath,
                mimetype: mimeType,
                isProfilePicture: isProfilePicture,

            },
        })
    }
    async getFileById(pictureId:number)
    {
        const picture = await this.prisma.upload_picture.findUnique({
            where: {
              id: +pictureId
            }
          });
           if(!picture) throw new NotFoundException('file not found');
        return picture;
    }
    
    async getFileByRelatedIdAndIsProfilePicture(relatedId: number, isProfilePicture: boolean){
        const picutre = await this.prisma.upload_picture.findFirst({
            where:{
                relatedId: relatedId,
                isProfilePicture: isProfilePicture
            }
        });
        return picutre;

    }
    async DeleteById(id:number){
        await this.prisma.upload_picture.delete({
            where:{
                id: id 
               }
        })
        return { message:'plik usunięty'}
    }
}