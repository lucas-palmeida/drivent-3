import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import hotelsService from '@/services/hotels-service';

export async function getHotels(req:AuthenticatedRequest, res: Response) {
    const { userId } = req;

    try {
        const hotels = await hotelsService.getHotels(userId);
        return res.status(httpStatus.OK).send(hotels);
    } catch (error) {
        if(error.name === 'notFound') {
            return res.sendStatus(httpStatus.NOT_FOUND);
        } else if(error.name === 'paymentRequiredError') {
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
        } else {
            return res.sendStatus(httpStatus.BAD_REQUEST);
        }
    }
}

export async function getHotelById(req:AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotelId = Number(req.params);

    if(!hotelId || isNaN(hotelId)) {
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }

    try {
        const hotel = await hotelsService.getHotelById(userId, hotelId);
        return res.send(httpStatus.OK).send(hotel);
    } catch (error) {
        if(error.name === 'notFound') return res.sendStatus(httpStatus.NOT_FOUND);
        return res.sendStatus(httpStatus.BAD_REQUEST);
    }
}