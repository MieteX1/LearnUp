import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Post } from "@nestjs/common";
import { RegisterUserDto } from './dto/Register_user.dto';
import { PrismaService } from 'src/prisma.service';
import { Role, User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { createModeratorDTO } from './dto/create_moderator.dto';
import { TaskCollectionService } from 'src/task_collection/task_collection.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private collectionService: TaskCollectionService //nagle bez powodu mi tutaj zaczęło wywalać błąd że nie może rozwiązać zależności, collectionService nigdzie nie jest wykorzysywany w tym pliku
  ) {}

  findAll() {
    return this.prisma.user.findMany();
  }
  findUnverified() {
    return this.prisma.user.findMany({
      where:{
        is_verified: false
      }
    });
  }
  findBanned() {
    return this.prisma.user.findMany({
        where: {
            NOT: {
                ban_date: null
            }
        }
    });
  }


  async create(dto: RegisterUserDto) {
    if (dto.password && !dto.password.startsWith('$2b$')) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      dto.password = hashedPassword;
    }

    return this.prisma.user.create({
      data: dto
    });
  }
  async createModerator(dto: createModeratorDTO)
  {
    return this.prisma.user.create({
      data: dto
    });
  }
  async getById(id: number) {
  const user = await this.prisma.user.findUnique({
    where: {
      id: +id
    }
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
  }
  async getUserWithAccessControl(
  id: number,
  requestingUserId?: number,
  requestingUserRole?: Role
) {
  const user = await this.getById(id);

  // Allow access if:
  // 1. The requesting user is an admin or moderator
  // 2. The requesting user is accessing their own profile
  const hasAccess =
    requestingUserRole === Role.admin ||
    requestingUserRole === Role.moderator ||
    requestingUserId === user.id;

  if (!hasAccess) {
    // Check for banned or deleted status
    if (user.ban_date) {
      throw new ForbiddenException('This user account is banned');
    }

    if (user.deleted_at) {
      throw new ForbiddenException('This user account has been deleted');
    }
  }

  return user;
}
  async update(id: number, dto: UpdateUserDto){
    const user = await this.getById(id);
    return this.prisma.user.update({
      where:{
        id: user.id
      },
      data: dto
    })
  }
  async delete(id: number,password:string){
   const user = await this.getById(id);// czy napisać tutaj zabezpieczenie sprawdzające czy deleted_at jest już ustawione?
    const isPasswordValid = await bcrypt.compare(password,user.password)
    if(isPasswordValid)
    {
      return this.prisma.user.update({
        where:{
        id: id 
       },
        data:  {
          deleted_at: new Date(),
          refresh_token: null
        }
      });
    }
    throw new BadRequestException('wrong passoword')
  }
  async adminDeleteUser(userId: number) {
    const user = await this.getById(userId);

    if (!user) {
        throw new NotFoundException('User not found');
    }

    if (user.role === Role.admin) {
        throw new ForbiddenException('Cannot delete admin accounts');
    }

    // Check if user is already deleted
    if (user.deleted_at) {
        throw new BadRequestException('User is already deleted');
    }

    // Soft delete - update deleted_at timestamp and remove refresh token
    return this.prisma.user.update({
        where: {
            id: userId
        },
        data: {
            deleted_at: new Date(),
            refresh_token: null
        }
    });
}

  async UpdateOnlineDate(id: number, currentTime: Date) {
    const user = await this.getById(id);

    return this.prisma.user.update({
      where:{
        id: user.id
      },
      data:  {
        last_activity: currentTime
      }
    });
  }

// funkcja do szukania użytkownika po emailu/loginie, potrzebna do sprawdzania danych przy logowaniu/autentykacji
  async findOneByEmail(email: string){
    const user = await this.prisma.user.findUnique({
      where: {
        email: email
      }
    })
   // if(!user) throw new NotFoundException('user not found'); //if do wyrzucenia zaleznie gdzie jest wywoływany raz potrzebne jest potwierdzenie że nie ma takiego usera w bazie a raz że jest. 

    return user;
  }
  //funkcja potwierdzająca weryfikację emailu w bazie 
  async VerificationUserEmail(email) {
    const user = await this.findOneByEmail(email)

    return this.prisma.user.update({
      where:{
        email: user.email
      },
      data:  {
        is_verified: true
      }
    });
  }
  //funckja zmieniająca hasło 
  async changeUserPassword(email:string,hashedPassword:string)
  {
    const user = await this.findOneByEmail(email)

    await this.prisma.user.update(
      {
        where:{
          email: user.email
        },
        data:  {
          password: hashedPassword
        }
      }
    )
  }
async banUser(userId: number) {
    const user = await this.getById(userId);

    if (!user) {
        throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
        where: {
            id: userId
        },
        data: {
            ban_date: new Date() // ustawia aktualną datę bana
        }
    });
  }

async unbanUser(userId: number) {
    const user = await this.getById(userId);

    if (!user) {
        throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
        where: {
            id: userId
        },
        data: {
            ban_date: null // usuwa bana
        }
    });
  }



  async GetActivityArchive(userId?: number, startDate?: Date, endDate?: Date) {
  interface UserTotalTime {
    user_id: number;
    login: string;
    total_time: string;
  }

  const query = `
    WITH user_sessions AS (
        SELECT
            u.id AS user_id,
            u.login,
            a."createAt" AS timestamp,
            COALESCE(
                LAG(a."createAt") OVER (PARTITION BY a."userId" ORDER BY a."createAt"),
                a."createAt"
            ) AS prev_timestamp,
            CASE
                WHEN EXTRACT(EPOCH FROM a."createAt" - 
                    COALESCE(LAG(a."createAt") OVER (PARTITION BY a."userId" ORDER BY a."createAt"), a."createAt")) > 1800
                THEN 1
                ELSE 0
            END AS new_session_flag
        FROM "Activity_archive" a
        JOIN "User" u ON a."userId" = u.id
    ),
    session_identifiers AS (
        SELECT
            user_id,
            login,
            timestamp,
            prev_timestamp,
            SUM(new_session_flag) OVER (PARTITION BY user_id ORDER BY timestamp) AS session_id
        FROM user_sessions
    ),
    session_durations AS (
        SELECT
            user_id,
            login,
            session_id,
            MIN(timestamp) AS session_start,
            MAX(timestamp) AS session_end,
            MAX(timestamp) - MIN(timestamp) AS session_interval
        FROM session_identifiers
        GROUP BY user_id, login, session_id
    )
    SELECT
        user_id,
        login,
        SUM(session_interval)::text AS total_time
    FROM session_durations
    WHERE 
        ($1::INTEGER IS NULL OR user_id = $1::INTEGER) AND
        ($2::TIMESTAMP IS NULL OR session_start >= $2::TIMESTAMP) AND
        ($3::TIMESTAMP IS NULL OR session_end <= $3::TIMESTAMP)
    GROUP BY user_id, login
    ORDER BY SUM(session_interval) DESC;
  `;

  const result = await this.prisma.$queryRawUnsafe<UserTotalTime[]>(
    query,
    userId,
    startDate,
    endDate
  );

  return result.map((row: any) => ({
    user_id: row.user_id,
    login: row.login,
    total_time: row.total_time,
    }));
  }
  
  
}
