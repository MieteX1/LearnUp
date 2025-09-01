import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateTaskCollectionDto } from './dto/create-task_collection.dto';
import { UpdateTaskCollectionDto } from './dto/update-task_collection.dto';
import { PrismaService } from 'src/prisma.service';
import { getTasks } from '@prisma/client/sql';
import { collectionFilter } from './collection.filter';
import { CreateRank } from './dto/create-rank.dto';
import { Role } from "@prisma/client";

@Injectable()
export class TaskCollectionService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTaskCollectionDto) {
    return this.prisma.task_collection.create({
      data: dto,
    });
  }

  findAll() {
    return this.prisma.task_collection.findMany();
  }

  async getProgress(user_id: number, collection_id: number) {
    const tasks = await this.prisma.$queryRaw<any[]>
    `
SELECT 
    tasks.id, 
    tasks.name, 
    tasks.order_, 
    tasks.difficulty, 
    tasks.category, 
    tasks.task_type, 
    COALESCE(answers.is_answered, FALSE) AS is_answered,
    COALESCE(answers.is_correct, FALSE) AS is_correct
FROM (
    SELECT id, name, order_, difficulty, category, 'card' AS task_type FROM public."Card" WHERE collection_id = ${collection_id}
    UNION ALL
    SELECT id, name, order_, difficulty, category, 'test' AS task_type FROM public."Task_test" WHERE collection_id = ${collection_id}
    UNION ALL
    SELECT id, name, order_, difficulty, category, 'open' AS task_type FROM public."Task_open" WHERE collection_id = ${collection_id}
    UNION ALL
    SELECT id, name, order_, difficulty, category, 'match' AS task_type FROM public."Task_match" WHERE collection_id = ${collection_id}
    UNION ALL
    SELECT id, name, order_, difficulty, category, 'gap' AS task_type FROM public."Task_gap" WHERE collection_id = ${collection_id}
) AS tasks
LEFT JOIN (
    SELECT 
        task_id, 
        task_type,
        CASE WHEN total_answers > 0 THEN TRUE ELSE FALSE END AS is_answered,
        is_correct
    FROM (
        -- Answer_test
        SELECT 
            a_test.test_id AS task_id, 
            'test' AS task_type,
            COUNT(*) AS total_answers, 
            BOOL_AND(t_opt.is_answer) AS is_correct 
        FROM public."Answer_test" a_test
        JOIN public."Test_option" t_opt 
            ON a_test.option_id = t_opt.id
        WHERE a_test.collection_id = ${collection_id} AND a_test.user_id = ${user_id}
        GROUP BY a_test.test_id

        UNION ALL

        -- Answer_gap
        SELECT 
            a_gap.gap_id AS task_id, 
            'gap' AS task_type,
            COUNT(*) AS total_answers, 
            BOOL_AND(LOWER(g_opt.answer) = LOWER(a_gap.answer)) AS is_correct  
        FROM public."Answer_gap" a_gap
        JOIN public."Gap_option" g_opt 
            ON a_gap.gap_id = g_opt.gap_id
        WHERE a_gap.collection_id = ${collection_id} AND a_gap.user_id = ${user_id}
        GROUP BY a_gap.gap_id

        UNION ALL

        -- Answer_open
        SELECT 
            a_open.open_id AS task_id, 
            'open' AS task_type,
            COUNT(*) AS total_answers,
            BOOL_AND(a_open.answer IS NOT NULL AND a_open.answer <> '') AS is_correct  
        FROM public."Answer_open" a_open
        WHERE a_open.collection_id = ${collection_id} AND a_open.user_id = ${user_id}
        GROUP BY a_open.open_id

        UNION ALL

        -- Answer_match
        SELECT 
            a_match.match_id AS task_id, 
            'match' AS task_type,
            COUNT(*) AS total_answers, 
            BOOL_AND(a_match.match_id = m_opt.match_id) AS is_correct  
        FROM public."Answer_match" a_match
        JOIN public."Match_option" m_opt 
            ON a_match.option_id = m_opt.id
        WHERE a_match.collection_id = ${collection_id} AND a_match.user_id = ${user_id}
        GROUP BY a_match.match_id
        HAVING COUNT(*) = (SELECT COUNT(*) FROM public."Match_option" WHERE match_id = a_match.match_id)

            ) AS answers
        ) AS answers
      ON tasks.id = answers.task_id AND tasks.task_type = answers.task_type
      ORDER BY tasks.order_ ASC, tasks.category;

    `;

    const filteredTasks = tasks.filter(task => task.task_type !== 'card');

    const totalTasks = filteredTasks.length;
    const answeredTasks = filteredTasks.filter(task => task.is_answered).length;
    const correctTasks = filteredTasks.filter(task => task.is_correct).length;

    const answeredPercent = totalTasks > 0 ? (answeredTasks / totalTasks) * 100 : 0;
    const correctPercent = totalTasks > 0 ? (correctTasks / totalTasks) * 100 : 0;

    const response = {
      tasks,
      answered_percent: answeredPercent,
      correct_percent: correctPercent
    };

    return response;
  }

  async howManySubscribers(id: number) {
    return await this.prisma.subscription.aggregate({
      where: {
        collection_id: id,
      },
      _count: {
        collection_id: true,
      },
    });
  }




async getUserCollections(
  userId: number,
  limit?: number,
  type: 'owned' | 'subscribed' | 'all' = 'all'
) {
  // Get collections owned by the user
  const ownedCollections = await this.prisma.task_collection.findMany({
    where: {
      author_id: userId
    },
    include: {
      _count: {
        select: {
          subscribers: true,
          rank: true
        }
      }
    },
    orderBy: {
      updated_at: 'desc'
    }
  });

  // Get collections subscribed by the user
  const subscribedCollections = await this.prisma.task_collection.findMany({
    where: {
      subscribers: {
        some: {
          subscriber_id: userId
        }
      },
      NOT: {
        author_id: 1
      }
    },
    include: {
      author: {
        select: {
          login: true,
          profile_picture: true,
          avatar_id: true,
        }
      },
      _count: {
        select: {
          subscribers: true,
          rank: true
        }
      }
    },
    orderBy: {
      updated_at: 'desc'
    }
  });

  // Calculate average rank for each collection
  const getAvgRank = async (collectionId: number) => {
    const avgRank = await this.prisma.collection_rank.aggregate({
      where: {
        collection_id: collectionId
      },
      _avg: {
        points: true
      }
    });
    return avgRank._avg.points;
  };

  // Add average rank to collections
  const ownedWithRank = await Promise.all(
    ownedCollections.map(async (collection) => ({
      ...collection,
      avgRank: await getAvgRank(collection.id),
      collectionType: 'owned'
    }))
  );

  const subscribedWithRank = await Promise.all(
    subscribedCollections.map(async (collection) => ({
      ...collection,
      avgRank: await getAvgRank(collection.id),
      collectionType: 'subscribed',
      author: {
        login: collection.author.login,
        profile_picture: collection.author.profile_picture,
        avatar_id: collection.author.avatar_id
      }
    }))
  );

  // Apply limits if specified
  const limitedOwned = limit ? ownedWithRank.slice(0, limit) : ownedWithRank;
  const limitedSubscribed = limit ? subscribedWithRank.slice(0, limit) : subscribedWithRank;

  // Return based on type parameter
  switch (type) {
    case 'owned':
      return {
        owned: limitedOwned
      };
    case 'subscribed':
      return {
        subscribed: limitedSubscribed
      };
    default:
      return {
        owned: limitedOwned,
        subscribed: limitedSubscribed
      };
  };
}

  async findManyWithFilter(filter: collectionFilter) {
    const query: any = {
      where: {
        NOT: {
          author_id: 1}},
      include: {},
      orderBy: [],
      take: filter.limit ?? 12,};
    query.include = {
      author: {
        select:{
          profile_picture: true,
          login: true,
          avatar_id: true}},
      _count: {
        select: {
          subscribers: true,
          rank: true,},},}; 
    if (filter.is_public != undefined) query.where.is_public = filter.is_public;
    else query.where.is_public = true;
    
    if (filter.author) query.where.author_id = filter.author;
    if (filter.collection_type)
      query.where.type_id = filter.collection_type;
    
    if (filter.new_first != undefined)
      query.orderBy.push({ ['updated_at']: filter.new_first ? 'desc' : 'asc' });
    if (filter.subscription_first != undefined)
      query.orderBy.push({
    subscribers: {
      _count: filter.subscription_first ? 'desc' : 'asc',},});
  const collections = await this.prisma.task_collection.findMany(query)
  .then(async (collections) => {
    const enrichedCollection = await Promise.all(
        collections.map(async (collection) => {
          collection["avg_rank"] = collection["_count"]["rank"]==0? 0: (await this.getRank(collection.id))._avg.points;
          return collection;}),);
      return enrichedCollection;});
    if (filter.best_first != undefined)
      collections.sort(function (a, b) {
        return filter.best_first? b["avg_rank"] - a["avg_rank"] : a["avg_rank"] - b["avg_rank"];});
    return collections; 
  }
  
  async getRank(id: number) {
    return await this.prisma.collection_rank.aggregate({
      where: {
        collection_id: id,
      },
      _avg: {
        points: true,
      },
      _count: {
        points: true,
      },
    });
  }

  async getRankByUserIdAndCollectionId(user_id: number, collection_id: number) {
    const rank = await this.prisma.collection_rank.findFirst({
      where: {
        user_id: user_id,
        collection_id: collection_id
      },
      select:{
        points: true
      }
    });

    if (!rank) {
      throw new NotFoundException('Rating not found');
    }

    return rank;
  }

  async setRank(dto: CreateRank) {
    // Check if user has already rated this collection
    const existingRank = await this.prisma.collection_rank.findFirst({
      where: {
        user_id: dto.user_id,
        collection_id: dto.collection_id
      }
    });

    if (existingRank) {
      // If rating exists, update it
      return await this.prisma.collection_rank.update({
        where: {
          id: existingRank.id
        },
        data: {
          points: dto.points
        }
      });
    }

    // If no rating exists, create a new one
    return await this.prisma.collection_rank.create({
      data: {
        points: dto.points,
        Task_collection: {
          connect: {
            id: dto.collection_id
          }
        },
        user: {
          connect: {
            id: dto.user_id
          }
        }
      }
    });
  }

  async findTasks(id: number) {
    //sql request with combining tables with all types of tasks and then sorting by difficulty
    // return await this.prisma.$queryRaw(getTasks(id));
    const tasks = await this.prisma.$queryRawTyped(getTasks(+id));
    if (!tasks) throw new NotFoundException('tasks not found');
    return tasks;
  }
  async findTaskWhitText(id: number, text: string) {
    const query = `
      select id, name, description, difficulty, category, order_, 'card' as type from public."Card"
      where (description ILIKE '%' || ${text} || '%' or name ILIKE '%' || ${text} || '%') and collection_id = ${id}
      UNION
      select id, name, description, difficulty, category, order_, 'test' as type from public."Task_test"
      where (description ILIKE '%' || ${text} || '%' or name ILIKE '%' || ${text} || '%') and collection_id = ${id}
      UNION
      select id, name, description, difficulty, category, order_, 'open' from public."Task_open"
      where (description ILIKE '%' || ${text} || '%' or name ILIKE '%' || ${text} || '%') and collection_id = ${id}
      UNION
      select id, name, description, difficulty, category, order_, 'match' from public."Task_match"
      where (description ILIKE '%' || ${text} || '%' or name ILIKE '%' || ${text} || '%') and collection_id = ${id}
      UNION
      select id, name, description, difficulty, category, order_, 'gap' from public."Task_gap"
      where (description ILIKE '%' || ${text} || '%' or name ILIKE '%' || ${text} || '%') and collection_id = ${id}
      order by category, order_ asc;`;

    return await this.prisma.$queryRawUnsafe(query);
  }

  async findCollectionWhitText(text: string) {
    return this.prisma.task_collection.findMany({
      where: {
        OR: [
          { name: { contains: text, mode: 'insensitive' } },
          { description: { contains: text, mode: 'insensitive' } },
        ],
        NOT: {
          is_public: false
        },
      },
      include: {
        subscribers: true,
        rank: true
      },
    });
  }

    async getById(id: number, userRole?: Role) {
  const collection = await this.prisma.task_collection.findUnique({
    where: {
      id: id,
    },
    include: {
      _count: {
        select: {
          rank: true,
        },
      },
    },
  });

  if (!collection) {
    throw new NotFoundException('collection not found');
  }

  if (collection.author_id === 1) {
    if (!userRole || (userRole !== Role.admin && userRole !== Role.moderator)) {
      throw new ForbiddenException('Access to this collection is forbidden');
    }
  }

  const avgRank = await this.prisma.collection_rank.aggregate({
    where: {
      collection_id: id,
    },
    _avg: {
      points: true,
    },
  });

  const collectionWithAvgRank = {
    ...collection,
    avgRank: avgRank._avg.points,
  };

  return collectionWithAvgRank;
}

  async getByAuthorId(id: number) {
    // Get author details
    const author = await this.prisma.user.findUnique({
      where: { id },
      select: {
        login: true,
        profile_picture: true,
        created_at: true,
        avatar_id: true,
      },
    });

    if (!author) throw new NotFoundException('author not found');

    // Get collections with rank and subscription data
    const collections = await this.prisma.task_collection.findMany({
      where: {
        author_id: id,
      },
      include: {
        rank: true,
        subscribers: true,
      },
    });

    // Calculate statistics
    const totalCollections = collections.length;
    const totalSubscribers = collections.reduce((sum, collection) =>
      sum + collection.subscribers.length, 0
    );

    // Calculate average rating
    const collectionsWithRatings = collections.filter(collection =>
      collection.rank.length > 0
    );

    const avgRating = collectionsWithRatings.length > 0
      ? collectionsWithRatings.reduce((sum, collection) => {
          const collectionAvg = collection.rank.reduce((rSum, r) => rSum + r.points, 0) / collection.rank.length;
          return sum + collectionAvg;
        }, 0) / collectionsWithRatings.length
      : 0;

    return {
      author: {
        login: author.login,
        profile_picture: author.profile_picture,
        created_at: author.created_at,
        avatar_id: author.avatar_id,
      },
      statistics: {
        total_collections: totalCollections,
        total_subscribers: totalSubscribers,
        average_rating: Number(avgRating.toFixed(2)),
      }
    };
  }

  // async changeAuthor(authorId: number){
  //   return this.prisma.task_collection.updateMany({
  //     where:{
  //       author_id: authorId
  //     },
  //     data: {
  //       author_id: 1
  //     }
  //   })
  // }

  async update(id: number, dto: UpdateTaskCollectionDto) {
    const collection = await this.getById(id);
    return this.prisma.task_collection.update({
      where: {
        id: collection.id,
      },
      data: dto,
    });
  }

  //make us the owners and hide task from public access
  async softDelete(id: number) {
    const collection = await this.getById(id);

    return this.prisma.task_collection.update({
      where: {
        id: collection.id,
      },
      data: {
        author_id: 1,
        is_public: false,
      },
    });
  }

  async delete(id: number) {
    const collection = await this.getById(id);

    return this.prisma.task_collection.delete({
      where: {
        id: collection.id,
      },
    });
  }
}
