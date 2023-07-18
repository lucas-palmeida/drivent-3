import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.business(), 
    },
  });
}

export async function createRoomsByHotelId(hotelId: number) {
  return prisma.room.create({
    data: {
      name: '123',
      capacity: 3,
      hotelId: hotelId,
    },
  });
}