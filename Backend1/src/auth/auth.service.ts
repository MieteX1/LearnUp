import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { NotificationService } from 'src/notification/notification.service';
import { NotFoundError } from 'rxjs';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { RegisterUserDto } from 'src/user/dto/Register_user.dto';
import { validateSync } from 'class-validator';



@Injectable()
export class AuthService { 
  constructor(
    private userService: UserService, 
    private jwtService: JwtService, 
    private prisma: PrismaService,
    private notificationService: NotificationService
  ){}



    async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneByEmail(email);
    // console.log('Validating user:', email);
    // console.log('User found:', !!user);

    if (!user) {
      return null;
    }
    //sprawdzanie czy użytkownik jest zbanowany
    if(user.ban_date != null)
    {
      throw new ForbiddenException ('User is banned');

    }
    if(!user.is_verified)
      {
        throw new ForbiddenException ('User is not verificed');
  
      }
    if(user.deleted_at)
      {
        throw new ForbiddenException ('User is deleted');
  
      }
    // Sprawdzenie czy hasło jest zahashowane
    if (!user.password.startsWith('$2b$')) {
     // console.log('WARNING: Password in database is not hashed!');
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    //console.log('Password validation result:', isPasswordValid);

    if (isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

      async register(registerUserDto: any): Promise<any> {
    //console.log('Starting registration process');

    const userExists = await this.userService.findOneByEmail(registerUserDto.email);
    if (userExists) {
      throw new ConflictException('Podany adres email został już zarejestrowany');
    }

    // Hashowanie hasła
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    //console.log('Password hashed successfully');

    const userData = {
      ...registerUserDto,
      password: hashedPassword
    };
    const payload = { email: registerUserDto.email};
    
    const resendVerifyEmailToken = this.jwtService.sign(payload, {
      secret: process.env.RESEND_VERIFIED_JWT_SECRET,
      expiresIn: process.env.RESEND_VERIFIED_JWT_EXPIRE_IN,
    });
    const user = await this.userService.create(userData);
    //console.log('User created successfully');
    await this.notificationService.sendVerivicationEmail(registerUserDto.email);
    //console.log('email weryfikacyjny został wysłany');
    const result = user.email;
   

    return {resendToken:resendVerifyEmailToken,result};
  }

      async login(user: any, res: Response) {
        const payload = { sub: user.id, roles: user.role };

        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, {
          secret: process.env.REFRESH_JWT_SECRET,
          expiresIn: process.env.REFRESH_JWT_EXPIRE_IN,
        });

        // Save refresh token to database
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refresh_token: refreshToken },
        });

         // Ustaw refresh token jako HTTP-only cookie
        res.cookie('refreshToken', refreshToken, {
          httpOnly: true, // Zabezpiecza przed dostępem przez JavaScript
          secure: process.env.NODE_ENV === 'production', // Używaj HTTPS w produkcji
          sameSite: 'strict', // Ochrona przed CSRF
          maxAge: 24 * 60 * 60 * 1000, // 24 godziny w milisekundach
          path: '/api/auth/refresh', // Cookie dostępne tylko dla endpointu refresh
        });

        return {
          payload: payload,
          access_token: accessToken,
        };
      }
        async verifyRefreshToken(userId: number, refreshToken: string): Promise<boolean> {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { refresh_token: true }
          });

          if (!user || !user.refresh_token) {
            return false;
          }

          try {
            // Weryfikuj token
            this.jwtService.verify(refreshToken, {
              secret: process.env.REFRESH_JWT_SECRET
            });

            // Sprawdź czy token zgadza się z tym w bazie
            return user.refresh_token === refreshToken;
          } catch {
            return false;
          }
        }

        async refreshToken(user: any,res: Response) {
          const userWithToken = await this.prisma.user.findUnique({
            where: { id: user.id },
            select: {
              id: true,
              refresh_token: true
            }
          });

          if (!userWithToken || !userWithToken.refresh_token) {
            throw new UnauthorizedException('Invalid refresh token');
          }

          //console.log(`User with ID ${user.id} is refreshing their token`);

          // Generowanie nowego access tokena
          const payload = { sub: user.id, roles: user.role };
          const accessToken = this.jwtService.sign(payload);

          return {
            access_token: accessToken,
          };
        }
        async logout(userId: number,res: Response) {
            // Remove refresh token from database
            await this.prisma.user.update({
              where: { id: userId },
              data: { refresh_token: null },
            });
            // Usuń cookie z refresh tokenem
            res.clearCookie('refreshToken', {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              path: '/api/auth/refresh',
            });


            return { message: 'Logged out successfully' };
        }

        async verifyEmail(token:string)
        {
          let payload;
          try{
            payload = await this.jwtService.verify(token,{secret: process.env.VERIFIED_JWT_SECRET})
            //console.log('1',payload.email)
          }catch(err){
            throw new BadRequestException('Invalid or expired token');
          }
          
           const user = await this.userService.findOneByEmail(payload.email)

           if(!user)
           {
            throw new BadRequestException('User nie istnieje');
           }
           if(user.is_verified)
           {
            throw new BadRequestException('Konto zostało już zweryfikowane')
           }
           //console.log(payload.email)
           try{
            await this.userService.VerificationUserEmail(payload.email);
           }catch{
            throw new BadRequestException('problem z weryfikacją konta')
           }
           return {message: 'Pomyślna weryfikacja'};

        }

        async resendVerifyEmail(email:string)
        {
          const user = await this.userService.findOneByEmail(email)

          if(!user)
          {
            throw new BadRequestException('User nie istnieje');
          }
          if(user.is_verified)
          {
            throw new BadRequestException('Konto zostało już zweryfikowane')
          }
          try{
            await this.notificationService.sendVerivicationEmail(email)
          }catch{
            throw new BadRequestException('problem z wyłaniem linku weryfikacyjnego')
          }
          return {message: "link weryfikacyjny został wysłany"};
        }

        async forgotPassword(email:string): Promise<void>
        {
          const user = await this.userService.findOneByEmail(email);
          if(!user)
          {
            throw new NotFoundException(`użytkownik o emailu ${email} nie istnieje`)
          }
          await this.notificationService.sendResetEmail(email);

        //  console.log('email z linkiem do resetu hasła został wysłany')
        }

        async resetPassword(token:string,newPassword:string)// endpoint 
        {
          let payload;
          try{
            payload = await this.jwtService.verify(token,{secret: process.env.FORGOT_PASSWORD_JWT_SECRET})
          }catch(err){
            throw new BadRequestException('Invalid or expired token');
          }
          const user = await this.userService.findOneByEmail(payload.email)

           if(!user)
           {
            throw new BadRequestException('User not exist');
           }
           // sprawdzanie hasła ustawianego przez moda czy spełnia wymagania z dto zwykłego użytkownika.(wszyskie zasady dotyczące hasła w jednym miejscu)
           const registerUserDto = new RegisterUserDto();
           registerUserDto.password = newPassword;
           const errors = validateSync(registerUserDto,{ whitelist: true }).filter((error) => error.property === 'password');// bez tego filtra sprawdza wszystkie zabezpieczenia z registerdto a ma sprawdzać tylko dotyczące password
           if(errors.length > 0)
           {
            const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat(); // spłaszczam obiekt z errorami bo wywalało więcej niż sam message błędu, zwraca tablicę bo błędów może być więcej niż jeden. np długość. brak jakiegoś znaku.
            throw new BadRequestException(errorMessages);// przekazanie błędu z registerdto co się nie zgadza w haśle
           }

           const hashedPassword = await bcrypt.hash(newPassword, 10);
           // console.log('Password hashed successfully');
           try{
            await this.userService.changeUserPassword(payload.email,hashedPassword);
           }catch{
            throw new BadRequestException('problem ze zmianą hasła')
           }
           return {message: 'Pomyślne resetowanie hasła'};
        }
        async changePassword(email:string,newPassword:string, oldPassword:string)
        {
            const user = await this.userService.findOneByEmail(email)
           if(!user)
           {
            throw new BadRequestException('User nie istnieje');
           }
           const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
           if(!isPasswordValid)
           {
            throw new BadRequestException('Invalid old password');
           }
           // sprawdzanie hasła ustawianego przez moda czy spełnia wymagania z dto zwykłego użytkownika.(wszyskie zasady dotyczące hasła w jednym miejscu)
           const registerUserDto = new RegisterUserDto();
           registerUserDto.password = newPassword;
           const errors = validateSync(registerUserDto,{ whitelist: true }).filter((error) => error.property === 'password');// bez tego filtra sprawdza wszystkie zabezpieczenia z registerdto a ma sprawdzać tylko dotyczące password
           if(errors.length > 0)
           {
            const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat(); // spłaszczam obiekt z errorami bo wywalało więcej niż sam message błędu, zwraca tablicę bo błędów może być więcej niż jeden. np długość. brak jakiegoś znaku.
            throw new BadRequestException(errorMessages);// przekazanie błędu z registerdto co się nie zgadza w haśle
           }

           const hashedPassword = await bcrypt.hash(newPassword, 10);
           // console.log('Password hashed successfully');
           try{
            await this.userService.changeUserPassword(email,hashedPassword);
           }catch{
            throw new BadRequestException('problem ze zemianą hasła')
           }
           return {message: 'Pomyślna zmiana hasła'};
        }
        async createModerator(moderatorDto: any)// zmienić any na createModeratorDTO
        {
           const userExists = await this.userService.findOneByEmail(moderatorDto.email);
         if (userExists) {
           throw new ConflictException('Podany adres email został już zarejestrowany');
         }// ZAPYTAĆ CZY TA FUNKCJA TUTAJ POTRZEBNA, czy da się zabezpieczyć jakoś żeby przez register nie dało się rejestrować na w domyśle poczcie firmowej?
        const userData = {
          ...moderatorDto,
          role: Role.moderator
        };
        const user = await this.userService.createModerator(userData);
       // console.log('User created successfully');
         await this.notificationService.SetupPasswordEmail(moderatorDto.email);
        // console.log('email weryfikacyjny został wysłany');
    
        return user;
        }
        async setupModeratorPassword(email:string,newPassword:string, login:string)
        {
         const user = await this.userService.findOneByEmail(email)
          if(!user)
          {
           throw new BadRequestException('User not exist');
          }
          if(user.password !== null)// sprawdzanie czy hasło już zostało ustawione aby nie dało się przed wygaśnięciem tokenu ustawiać hasła kilka razy.
          {
            throw new BadRequestException('Account have a password')
          }
          // sprawdzanie hasła ustawianego przez moda czy spełnia wymagania z dto zwykłego użytkownika.(wszyskie zasady dotyczące hasła w jednym miejscu)
           const registerUserDto = new RegisterUserDto();
           registerUserDto.password = newPassword;
           const errors = validateSync(registerUserDto,{ whitelist: true }).filter((error) => error.property === 'password');// bez tego filtra sprawdza wszystkie zabezpieczenia z registerdto a ma sprawdzać tylko dotyczące password
           if(errors.length > 0)
           {
            const errorMessages = errors.map((error) => Object.values(error.constraints || {})).flat(); // spłaszczam obiekt z errorami bo wywalało więcej niż sam message błędu, zwraca tablicę bo błędów może być więcej niż jeden. np długość. brak jakiegoś znaku.
            throw new BadRequestException(errorMessages);// przekazanie błędu z registerdto co się nie zgadza w haśle
           }

          const hashedPassword = await bcrypt.hash(newPassword, 10);
         // console.log('Password hashed successfully');
         try{
           await this.userService.changeUserPassword(email,hashedPassword);
           const dto = {login:login}
           await this.userService.update(user.id,dto)
          }catch{
           throw new BadRequestException('problem ze zemianą hasła')
          }
           try{
           await this.userService.VerificationUserEmail(email);
           }catch{
             throw new BadRequestException('problem z weryfikacją konta')
          }
          return {message: 'pomyślna weryfikacja oraz ustawienie hasła'};
        }
};