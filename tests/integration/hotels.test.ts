import app, { init } from "@/app";
import { prisma } from "@/config";
import faker from "@faker-js/faker";
import supertest from "supertest";
import { cleanDb, generateValidToken } from "../helpers";
import httpStatus from "http-status";
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createTicketTypeRemoteOrHotel, createUser } from "../factories";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createHotel } from "../factories/hotels-factory";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 404 when user doesnt have a enrollment', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
    
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
    
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with status 404 when user doesnt have a ticket', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with status 402 when ticket has not been paid', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when ticket type is remote', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemoteOrHotel(true, true)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when ticket type doesnt includes hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemoteOrHotel(false, false)
        await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 200 and hotels data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemoteOrHotel(false, true)
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        await createHotel();
        
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

        expect(response.status).toEqual(httpStatus.OK);
        expect(response.body).toContain(expect.arrayContaining(expect.objectContaining(
            {
                id: expect.any(Number),
                name: expect.any(String),
                image: expect.any(String),
                createdAt: expect.any(Date),
                updatedAt: expect.any(Date),
            }
        )));
      });

    //   it('should respond with status 200 and with payment data', async () => {
    //     const user = await createUser();
    //     const token = await generateValidToken(user);
    //     const enrollment = await createEnrollmentWithAddress(user);
    //     const ticketType = await createTicketType();
    //     const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
  
    //     const payment = await createPayment(ticket.id, ticketType.price);
  
    //     const response = await server.get(`/payments?ticketId=${ticket.id}`).set('Authorization', `Bearer ${token}`);
  
    //     expect(response.status).toEqual(httpStatus.OK);
    //     expect(response.body).toEqual({
    //       id: expect.any(Number),
    //       ticketId: ticket.id,
    //       value: ticketType.price,
    //       cardIssuer: payment.cardIssuer,
    //       cardLastDigits: payment.cardLastDigits,
    //       createdAt: expect.any(String),
    //       updatedAt: expect.any(String),
    //     });
    //   });
    });
  });