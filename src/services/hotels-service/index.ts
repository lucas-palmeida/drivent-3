import { notFoundError, paymentRequiredError } from "@/errors";
import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelsRepository from "@/repositories/hotel-repository";
import ticketsRepository from "@/repositories/tickets-repository";
import { Hotel, TicketStatus } from "@prisma/client";

async function getHotels(userId: number): Promise<Hotel[]> {
    await verifyEnrollmentAndTicket(userId);

    const hotels = await hotelsRepository.getHotels();

    if(hotels.length < 1) throw notFoundError();
    
    return hotels;
}

async function getHotelById(userId: number, hotelId: number): Promise<Hotel> {
    await verifyEnrollmentAndTicket(hotelId);

    const hotel = await hotelsRepository.getHotelById(hotelId);

    if(!hotel) throw notFoundError();

    return hotel;
}

async function verifyEnrollmentAndTicket(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();
    
    if(ticket.status !== TicketStatus.PAID || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) throw paymentRequiredError();
}

const hotelsService = {
    getHotels,
    getHotelById
}

export default hotelsService;