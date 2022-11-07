
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      avatarUrl: 'https://github.com/thetunnes.png'
    }
  })

  const pool = await prisma.pool.create({
    data: {
      title: 'Example Pool',
      code: 'BOL123',
      ownerId: user.id,

      Participant: {
        create: {
          userId: user.id,
        }
      }
    }
  })

  await prisma.game.create({
    data: {
      date: '2022-11-01T12:00:00.339Z',
      firstTeamCountryCode: 'BR',
      secondTeamCountryCode: 'DE'
    }
  })


  await prisma.game.create({
    data: {
      date: '2022-11-05T12:00:00.339Z',
      firstTeamCountryCode: 'AR',
      secondTeamCountryCode: 'DE',

      guesses: {
        create: {
          firstTeamPoints: 2,
          secondTeamPoints: 4,
          
          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id
              }
            }
          }
        }
      }
    }
  })
  // const participant = await prisma.participant.create({
  //   data: {
  //     poolId: pool.id,
  //     userId: user.id 
  //   }
  // })

}

main()