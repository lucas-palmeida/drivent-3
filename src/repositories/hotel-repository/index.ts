import { prisma } from "@/config";

async function getHotels() {
    return prisma.hotel.findMany();
}

async function getHotelById(id: number) {
    return prisma.hotel.findFirst({
        where: { 
            id,
        },
        include: {
            Rooms: true,
        },
    });
}

const hotelsRepository = {
    getHotels,
    getHotelById,
};

export default hotelsRepository;