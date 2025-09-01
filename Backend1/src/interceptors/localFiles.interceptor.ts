import { CallHandler, ExecutionContext, Injectable, mixin, NestInterceptor, Type } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import multer, { diskStorage } from "multer";


interface LocalFilesInterceptorOptions {
    fieldName: string;
    path?:string;
    fileFilter?: MulterOptions['fileFilter'];
    limits?: MulterOptions['limits'];
}

function LocalFilesInterceptor(options: LocalFilesInterceptorOptions): Type<NestInterceptor>{
    @Injectable()
    class Interceptor implements NestInterceptor{
        fileInterceptor: NestInterceptor;
        constructor(){
            const filesDestination = process.env.UPLOAD_PATH
            const destination = `${filesDestination}${options.path}`
            const multerOptions : MulterOptions ={
                storage: diskStorage({
                    destination
                }),
                fileFilter: options.fileFilter,
                limits: options.limits,
            }
            this.fileInterceptor = new (FileInterceptor(options.fieldName, multerOptions))
        }
       intercept(...args: Parameters<NestInterceptor['intercept']>) {
         return this.fileInterceptor.intercept(...args);
       }
    }
    return mixin(Interceptor);
}

export default LocalFilesInterceptor; 