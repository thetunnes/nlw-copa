import { FastifyInstance } from "fastify";

import { z } from "zod";
import { authenticate } from "../plugins/authenticate";
import { prisma } from './../lib/prisma';



export async function authRoutes(fastify: FastifyInstance) {

  fastify.get('/me', {
    onRequest: [authenticate]
  }, async (req) => {
    return { user: req.user }
  })

  fastify.post('/users', async (req, rep) => {
    const createUserBody = z.object({
      access_token: z.string()
    })

    const { access_token } = createUserBody.parse(req.body)

    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    })

    const userData = await userResponse.json()

    const userInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url()
    })

    const userInfo = userInfoSchema.parse(userData)


    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id
      }
    })


    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatarUrl: userInfo.picture
        }
      })
    }

    // Refresh Token deve ser implementado quando não queremos que deslogue da aplicação
    // assim quando o token estiver expirado, se as informações do payload estiverem corretas
    // um novo token é gerado, podendo autenticar novamente.

    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarUrl
    }, {
      sub: user.id,
      expiresIn: '7 days'
    })

    return { userInfo, token }
  })
}